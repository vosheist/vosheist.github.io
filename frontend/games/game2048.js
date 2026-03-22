/* 2048-style game implemented from scratch (vanilla JS)
   Usage: Game2048.init(containerElement)
*/
(function (global) {
    const SIZE = 4;
    const SESSION_KEY = "vosHeistCurrentUser";
    const GAME_KEY = "2048";

    function emptyBoard() {
        return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    }

    function randomEmptyCell(board) {
        const cells = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (board[r][c] === 0) cells.push([r, c]);
            }
        }
        if (!cells.length) return null;
        return cells[Math.floor(Math.random() * cells.length)];
    }

    function addTile(board) {
        const cell = randomEmptyCell(board);
        if (!cell) return;
        const [r, c] = cell;
        board[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    function compressRow(row) {
        const values = row.filter((n) => n !== 0);
        const out = [];
        let scoreGain = 0;

        for (let i = 0; i < values.length; i++) {
            if (values[i] === values[i + 1]) {
                const merged = values[i] * 2;
                out.push(merged);
                scoreGain += merged;
                i += 1;
            } else {
                out.push(values[i]);
            }
        }

        while (out.length < SIZE) out.push(0);
        return { row: out, scoreGain };
    }

    function transpose(matrix) {
        return matrix[0].map((_, c) => matrix.map((row) => row[c]));
    }

    function reverseRows(matrix) {
        return matrix.map((row) => row.slice().reverse());
    }

    function move(board, dir) {
        let work = board.map((row) => row.slice());

        if (dir === "up" || dir === "down") work = transpose(work);
        if (dir === "right" || dir === "down") work = reverseRows(work);

        let moved = false;
        let scoreGain = 0;
        const next = work.map((row, idx) => {
            const { row: compressed, scoreGain: gain } = compressRow(row);
            if (compressed.join(",") !== row.join(",")) moved = true;
            scoreGain += gain;
            return compressed;
        });

        let out = next;
        if (dir === "right" || dir === "down") out = reverseRows(out);
        if (dir === "up" || dir === "down") out = transpose(out);

        return { board: out, moved, scoreGain };
    }

    function canMove(board) {
        if (randomEmptyCell(board)) return true;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const v = board[r][c];
                if ((r + 1 < SIZE && board[r + 1][c] === v) || (c + 1 < SIZE && board[r][c + 1] === v)) {
                    return true;
                }
            }
        }
        return false;
    }

    function tileClass(v) {
        if (!v) return "g2048-tile g2048-0";
        return `g2048-tile g2048-${v}`;
    }

    function init(container) {
        if (!container) return null;
        container.innerHTML = "";

        let board = emptyBoard();
        let score = 0;
        let best = Number(localStorage.getItem("vosheist-2048-best") || 0);
        let history = [];
        let submittedThisRun = false;
        addTile(board);
        addTile(board);

        const wrap = document.createElement("div");
        wrap.className = "g2048-wrap";

        const top = document.createElement("div");
        top.className = "g2048-top";

        const scoreEl = document.createElement("span");
        scoreEl.className = "badge text-bg-light border";

        const bestEl = document.createElement("span");
        bestEl.className = "badge text-bg-light border";

        const reset = document.createElement("button");
        reset.className = "btn btn-sm btn-outline-secondary";
        reset.textContent = "New Game";

        const undo = document.createElement("button");
        undo.className = "btn btn-sm btn-outline-primary";
        undo.textContent = "Undo";
        undo.disabled = true;

        top.appendChild(scoreEl);
        top.appendChild(bestEl);
        top.appendChild(undo);
        top.appendChild(reset);

        const boardEl = document.createElement("div");
        boardEl.className = "g2048-board";

        const status = document.createElement("small");
        status.className = "text-secondary";

        const leaderboard = document.createElement("div");
        leaderboard.className = "g2048-leaderboard mt-2";
        leaderboard.innerHTML = `
            <h2 class="h6 mb-1">2048 Leaderboard</h2>
            <ol class="g2048-score-list mb-1"></ol>
            <small class="text-secondary g2048-note"></small>
        `;

        const scoreList = leaderboard.querySelector(".g2048-score-list");
        const boardNote = leaderboard.querySelector(".g2048-note");

        wrap.appendChild(top);
        wrap.appendChild(boardEl);
        wrap.appendChild(status);
        wrap.appendChild(leaderboard);
        container.appendChild(wrap);

        async function refreshLeaderboard() {
            if (!global.vosHeistApi || typeof global.vosHeistApi.getGameScores !== "function") {
                scoreList.innerHTML = "<li>API unavailable</li>";
                boardNote.textContent = "";
                return;
            }

            try {
                const payload = await global.vosHeistApi.getGameScores(GAME_KEY);
                const rows = Array.isArray(payload.scores) ? payload.scores : [];
                if (!rows.length) {
                    scoreList.innerHTML = "<li>No scores yet</li>";
                } else {
                    scoreList.innerHTML = rows.slice(0, 8).map((row) => {
                        const name = row.nickname || row.displayName || row.userKey || "Player";
                        return `<li><span>${name}</span><strong>${row.score}</strong></li>`;
                    }).join("");
                }

                const currentUserKey = sessionStorage.getItem(SESSION_KEY);
                boardNote.textContent = currentUserKey
                    ? "Your best is auto-saved when your run ends."
                    : "Log in to publish your score.";
            } catch {
                scoreList.innerHTML = "<li>Could not load scores</li>";
                boardNote.textContent = "";
            }
        }

        async function submitScoreIfNeeded() {
            if (submittedThisRun || score <= 0) return;
            const currentUserKey = sessionStorage.getItem(SESSION_KEY);
            if (!currentUserKey) return;
            if (!global.vosHeistApi || typeof global.vosHeistApi.submitGameScore !== "function") return;

            try {
                await global.vosHeistApi.submitGameScore(GAME_KEY, {
                    userKey: currentUserKey,
                    score
                });
                submittedThisRun = true;
                await refreshLeaderboard();
            } catch {
                // Keep gameplay smooth even if leaderboard submit fails.
            }
        }

        function draw() {
            boardEl.innerHTML = "";
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    const v = board[r][c];
                    const tile = document.createElement("div");
                    tile.className = tileClass(v);
                    tile.textContent = v ? String(v) : "";
                    boardEl.appendChild(tile);
                }
            }
            scoreEl.textContent = `Score: ${score}`;
            bestEl.textContent = `Best: ${best}`;
            const movable = canMove(board);
            status.textContent = movable ? "Use arrows or swipe" : "Game over";
            if (!movable) {
                submitScoreIfNeeded();
            }
        }

        function resetGame() {
            board = emptyBoard();
            score = 0;
            history = [];
            submittedThisRun = false;
            undo.disabled = true;
            addTile(board);
            addTile(board);
            draw();
        }

        function applyMove(dir) {
            if (!canMove(board)) return;
            const snapshot = {
                board: board.map((row) => row.slice()),
                score
            };
            const res = move(board, dir);
            if (!res.moved) return;
            history.push(snapshot);
            if (history.length > 60) history.shift();
            undo.disabled = history.length === 0;
            board = res.board;
            score += res.scoreGain;
            if (score > best) {
                best = score;
                localStorage.setItem("vosheist-2048-best", String(best));
            }
            addTile(board);
            draw();
        }

        function undoMove() {
            if (!history.length) return;
            const prev = history.pop();
            board = prev.board.map((row) => row.slice());
            score = prev.score;
            undo.disabled = history.length === 0;
            draw();
        }

        function keyHandler(e) {
            if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
            e.preventDefault();
            if (e.key === "ArrowUp") applyMove("up");
            if (e.key === "ArrowDown") applyMove("down");
            if (e.key === "ArrowLeft") applyMove("left");
            if (e.key === "ArrowRight") applyMove("right");
        }

        let startX = 0;
        let startY = 0;
        boardEl.addEventListener("touchstart", (e) => {
            const t = e.changedTouches[0];
            startX = t.clientX;
            startY = t.clientY;
        }, { passive: true });

        boardEl.addEventListener("touchend", (e) => {
            const t = e.changedTouches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
            if (Math.abs(dx) > Math.abs(dy)) {
                applyMove(dx > 0 ? "right" : "left");
            } else {
                applyMove(dy > 0 ? "down" : "up");
            }
        }, { passive: true });

        reset.addEventListener("click", resetGame);
        undo.addEventListener("click", undoMove);
        window.addEventListener("keydown", keyHandler);
        refreshLeaderboard();
        draw();

        return {
            destroy() {
                window.removeEventListener("keydown", keyHandler);
            }
        };
    }

    global.Game2048 = { init };
})(window);
