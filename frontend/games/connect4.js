/* Connect Four vs Computer
   Usage: Connect4Game.init(containerElement)
*/
(function (global) {
    const ROWS = 6;
    const COLS = 7;

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

        container.appendChild(boardEl);
        container.appendChild(status);
        container.appendChild(reset);

        let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        let running = true;
        let playerTurn = true; // player=1, computer=2

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

            const col = valid[Math.floor(Math.random() * valid.length)];
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
        restart();

        return { reset: restart };
    }

    global.Connect4Game = { init };
})(window);
