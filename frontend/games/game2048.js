/* 2048-style game implemented from scratch (vanilla JS)
   Usage: Game2048.init(containerElement)
*/
(function (global) {
    const SIZE = 4;

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

        top.appendChild(scoreEl);
        top.appendChild(bestEl);
        top.appendChild(reset);

        const boardEl = document.createElement("div");
        boardEl.className = "g2048-board";

        const status = document.createElement("small");
        status.className = "text-secondary";

        wrap.appendChild(top);
        wrap.appendChild(boardEl);
        wrap.appendChild(status);
        container.appendChild(wrap);

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
            status.textContent = canMove(board) ? "Use arrows or swipe" : "Game over";
        }

        function resetGame() {
            board = emptyBoard();
            score = 0;
            addTile(board);
            addTile(board);
            draw();
        }

        function applyMove(dir) {
            if (!canMove(board)) return;
            const res = move(board, dir);
            if (!res.moved) return;
            board = res.board;
            score += res.scoreGain;
            if (score > best) {
                best = score;
                localStorage.setItem("vosheist-2048-best", String(best));
            }
            addTile(board);
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
        window.addEventListener("keydown", keyHandler);
        draw();

        return {
            destroy() {
                window.removeEventListener("keydown", keyHandler);
            }
        };
    }

    global.Game2048 = { init };
})(window);
