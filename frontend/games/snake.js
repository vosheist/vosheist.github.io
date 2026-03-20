/* Snake game (single-player)
   Usage: SnakeGame.init(containerElement)
*/
(function (global) {
    function init(container) {
        if (!container) return null;
        container.innerHTML = "";

        const size = 14;
        const board = document.createElement("div");
        board.className = "snake-board";
        board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

        const status = document.createElement("small");
        status.className = "text-secondary d-block mt-2";

        const reset = document.createElement("button");
        reset.className = "btn btn-outline-secondary btn-sm mt-2";
        reset.textContent = "New Game";

        container.appendChild(board);
        container.appendChild(status);
        container.appendChild(reset);

        let snake = [{ x: 6, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 7 }];
        let dir = { x: 1, y: 0 };
        let food = { x: 10, y: 7 };
        let timer = null;
        let score = 0;
        let running = true;

        function placeFood() {
            while (true) {
                const x = Math.floor(Math.random() * size);
                const y = Math.floor(Math.random() * size);
                if (!snake.some((s) => s.x === x && s.y === y)) {
                    food = { x, y };
                    return;
                }
            }
        }

        function render() {
            board.innerHTML = "";
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const cell = document.createElement("div");
                    cell.className = "snake-cell";
                    if (x === food.x && y === food.y) {
                        cell.classList.add("snake-food");
                    }
                    const idx = snake.findIndex((s) => s.x === x && s.y === y);
                    if (idx === 0) cell.classList.add("snake-head");
                    else if (idx > 0) cell.classList.add("snake-body");
                    board.appendChild(cell);
                }
            }
            status.textContent = running ? `Score: ${score}` : `Game over. Score: ${score}`;
        }

        function step() {
            if (!running) return;
            const head = snake[0];
            const next = { x: head.x + dir.x, y: head.y + dir.y };

            if (
                next.x < 0 || next.y < 0 || next.x >= size || next.y >= size ||
                snake.some((s) => s.x === next.x && s.y === next.y)
            ) {
                running = false;
                render();
                return;
            }

            snake.unshift(next);
            if (next.x === food.x && next.y === food.y) {
                score += 1;
                placeFood();
            } else {
                snake.pop();
            }
            render();
        }

        function keyHandler(e) {
            if (e.key === "ArrowUp" && dir.y !== 1) dir = { x: 0, y: -1 };
            if (e.key === "ArrowDown" && dir.y !== -1) dir = { x: 0, y: 1 };
            if (e.key === "ArrowLeft" && dir.x !== 1) dir = { x: -1, y: 0 };
            if (e.key === "ArrowRight" && dir.x !== -1) dir = { x: 1, y: 0 };
        }

        function restart() {
            snake = [{ x: 6, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 7 }];
            dir = { x: 1, y: 0 };
            score = 0;
            running = true;
            placeFood();
            render();
        }

        window.addEventListener("keydown", keyHandler);
        reset.addEventListener("click", restart);

        timer = setInterval(step, 150);
        render();

        return {
            destroy() {
                window.removeEventListener("keydown", keyHandler);
                clearInterval(timer);
            }
        };
    }

    global.SnakeGame = { init };
})(window);
