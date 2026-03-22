/* Connect Four vs Computer
   Usage: Connect4Game.init(containerElement)
*/
(function (global) {
    const ROWS = 6;
    const COLS = 7;
    const SESSION_KEY = "vosHeistCurrentUser";
    const GAME_KEY = "connect4";

    function init(container) {
        if (!container) return null;
        container.innerHTML = "";

        const boardEl = document.createElement("div");
        boardEl.className = "c4-board";
        boardEl.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;

        const status = document.createElement("small");
        status.className = "text-secondary d-block mt-2";

        const reset = document.createElement("button");
        reset.className = "btn btn-outline-secondary btn-sm mt-2";
        reset.textContent = "New Game";

        const leaderboard = document.createElement("div");
        leaderboard.className = "game-leaderboard mt-2";
        leaderboard.innerHTML = `
            <h2 class="h6 mb-1">Connect 4 Leaderboard</h2>
            <ol class="game-score-list mb-1"></ol>
            <small class="text-secondary game-score-note"></small>
        `;
        const scoreList = leaderboard.querySelector(".game-score-list");
        const scoreNote = leaderboard.querySelector(".game-score-note");

        container.appendChild(boardEl);
        container.appendChild(status);
        container.appendChild(reset);
        container.appendChild(leaderboard);

        let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        let running = true;
        let playerTurn = true; // player=1, computer=2
        let wins = 0;

        async function refreshLeaderboard() {
            if (!global.vosHeistApi || typeof global.vosHeistApi.getGameScores !== "function") {
                scoreList.innerHTML = "<li>API unavailable</li>";
                scoreNote.textContent = "";
                return;
            }
            try {
                const payload = await global.vosHeistApi.getGameScores(GAME_KEY);
                const rows = Array.isArray(payload.scores) ? payload.scores : [];
                scoreList.innerHTML = rows.length
                    ? rows.slice(0, 8).map((row) => {
                        const name = row.nickname || row.displayName || row.userKey || "Player";
                        return `<li><span>${name}</span><strong>${row.score}</strong></li>`;
                    }).join("")
                    : "<li>No scores yet</li>";
                scoreNote.textContent = sessionStorage.getItem(SESSION_KEY)
                    ? "Wins against the computer are tracked."
                    : "Log in to publish your score.";
            } catch {
                scoreList.innerHTML = "<li>Could not load scores</li>";
                scoreNote.textContent = "";
            }
        }

        async function submitWins() {
            if (wins <= 0) return;
            const userKey = sessionStorage.getItem(SESSION_KEY);
            if (!userKey || !global.vosHeistApi || typeof global.vosHeistApi.submitGameScore !== "function") return;
            try {
                await global.vosHeistApi.submitGameScore(GAME_KEY, { userKey, score: wins });
                await refreshLeaderboard();
            } catch {
                // Ignore leaderboard submission failures.
            }
        }

        function availableRow(col) {
            for (let r = ROWS - 1; r >= 0; r--) {
                if (board[r][col] === 0) return r;
            }
            return -1;
        }

        function checkWin(token) {
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (board[r][c] !== token) continue;
                    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
                    for (const [dr, dc] of dirs) {
                        let ok = true;
                        for (let i = 1; i < 4; i++) {
                            const nr = r + dr * i;
                            const nc = c + dc * i;
                            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== token) {
                                ok = false;
                                break;
                            }
                        }
                        if (ok) return true;
                    }
                }
            }
            return false;
        }

        function boardFull() {
            return board[0].every((v) => v !== 0);
        }

        function scoreColumnPreference(col) {
            const center = Math.floor(COLS / 2);
            return center - Math.abs(center - col);
        }

        function findWinningCol(token) {
            for (let c = 0; c < COLS; c++) {
                const r = availableRow(c);
                if (r < 0) continue;
                board[r][c] = token;
                const win = checkWin(token);
                board[r][c] = 0;
                if (win) return c;
            }
            return -1;
        }

        function render() {
            boardEl.innerHTML = "";
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const cell = document.createElement("button");
                    cell.className = "c4-cell";
                    if (board[r][c] === 1) cell.classList.add("c4-player");
                    if (board[r][c] === 2) cell.classList.add("c4-cpu");
                    cell.disabled = !running;
                    cell.addEventListener("click", () => playerDrop(c));
                    boardEl.appendChild(cell);
                }
            }

            if (!running) return;
            status.textContent = playerTurn ? "Your turn" : "Computer is thinking...";
        }

        function cpuMove() {
            const valid = [];
            for (let c = 0; c < COLS; c++) if (availableRow(c) >= 0) valid.push(c);
            if (!valid.length) return;

            // 1) Try immediate win, 2) block player win, 3) favor center columns.
            let col = findWinningCol(2);
            if (col < 0) col = findWinningCol(1);
            if (col < 0) {
                const scored = valid
                    .map((c) => ({ c, s: scoreColumnPreference(c) + Math.random() * 0.4 }))
                    .sort((a, b) => b.s - a.s);
                col = scored[0].c;
            }

            const row = availableRow(col);
            board[row][col] = 2;

            if (checkWin(2)) {
                running = false;
                status.textContent = "Computer wins";
                render();
                return;
            }

            if (boardFull()) {
                running = false;
                status.textContent = "Draw";
                render();
                return;
            }

            playerTurn = true;
            render();
        }

        function playerDrop(col) {
            if (!running || !playerTurn) return;
            const row = availableRow(col);
            if (row < 0) return;
            board[row][col] = 1;

            if (checkWin(1)) {
                running = false;
                status.textContent = "You win";
                wins += 1;
                submitWins();
                render();
                return;
            }

            if (boardFull()) {
                running = false;
                status.textContent = "Draw";
                render();
                return;
            }

            playerTurn = false;
            render();
            setTimeout(cpuMove, 360);
        }

        function restart() {
            board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
            running = true;
            playerTurn = true;
            render();
        }

        reset.addEventListener("click", restart);
        refreshLeaderboard();
        restart();

        return { reset: restart };
    }

    global.Connect4Game = { init };
})(window);
