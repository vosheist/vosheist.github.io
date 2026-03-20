/* Simple lane racer (single-player)
   Usage: LaneRacerGame.init(containerElement)
*/
(function (global) {
    function init(container) {
        if (!container) return null;
        container.innerHTML = "";

        const lanes = 3;
        const rows = 14;

        const board = document.createElement("div");
        board.className = "lr-board";
        board.style.gridTemplateColumns = `repeat(${lanes}, 1fr)`;

        const status = document.createElement("small");
        status.className = "text-secondary d-block mt-2";

        const reset = document.createElement("button");
        reset.className = "btn btn-outline-secondary btn-sm mt-2";
        reset.textContent = "Restart";

        container.appendChild(board);
        container.appendChild(status);
        container.appendChild(reset);

        let playerLane = 1;
        let obstacles = [];
        let ticks = 0;
        let running = true;
        let timer = null;

        function spawnObstacle() {
            obstacles.push({ lane: Math.floor(Math.random() * lanes), row: 0 });
        }

        function render() {
            board.innerHTML = "";
            for (let r = 0; r < rows; r++) {
                for (let l = 0; l < lanes; l++) {
                    const cell = document.createElement("div");
                    cell.className = "lr-cell";
                    const hasObstacle = obstacles.some((o) => o.row === r && o.lane === l);
                    const isPlayer = r === rows - 1 && l === playerLane;
                    if (hasObstacle) cell.classList.add("lr-obstacle");
                    if (isPlayer) cell.classList.add("lr-player");
                    board.appendChild(cell);
                }
            }
            status.textContent = running ? `Score: ${ticks}` : `Crash! Score: ${ticks}`;
        }

        function step() {
            if (!running) return;
            ticks += 1;
            if (ticks % 5 === 0) spawnObstacle();

            obstacles = obstacles.map((o) => ({ ...o, row: o.row + 1 })).filter((o) => o.row < rows);

            if (obstacles.some((o) => o.row === rows - 1 && o.lane === playerLane)) {
                running = false;
                render();
                return;
            }

            render();
        }

        function keyHandler(e) {
            if (!running) return;
            if (e.key === "ArrowLeft") playerLane = Math.max(0, playerLane - 1);
            if (e.key === "ArrowRight") playerLane = Math.min(lanes - 1, playerLane + 1);
            render();
        }

        function restart() {
            playerLane = 1;
            obstacles = [];
            ticks = 0;
            running = true;
            render();
        }

        window.addEventListener("keydown", keyHandler);
        reset.addEventListener("click", restart);
        timer = setInterval(step, 180);
        restart();

        return {
            destroy() {
                window.removeEventListener("keydown", keyHandler);
                clearInterval(timer);
            }
        };
    }

    global.LaneRacerGame = { init };
})(window);
