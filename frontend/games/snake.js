/* Snake game (single-player)
   Usage: SnakeGame.init(containerElement)
*/
(function (global) {
    const SESSION_KEY = "vosHeistCurrentUser";
    const GAME_KEY = "snake";

    function init(container) {
        if (!container) return null;
        container.innerHTML = "";

        const size = 14;
        const board = document.createElement("div");
        board.className = "snake-board";
        board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

        const status = document.createElement("small");
        status.className = "text-secondary d-block mt-2";

        const best = document.createElement("small");
        best.className = "text-secondary d-block";
        let bestScore = Number(localStorage.getItem("vosheist-snake-best") || 0);
        best.textContent = `Best: ${bestScore}`;

        const reset = document.createElement("button");
        reset.className = "btn btn-outline-secondary btn-sm mt-2";
        reset.textContent = "New Game";

        const pause = document.createElement("button");
        pause.className = "btn btn-outline-primary btn-sm mt-2 ms-2";
        pause.textContent = "Pause";

        const controls = document.createElement("div");
        controls.className = "d-flex flex-wrap gap-2 mt-2";
        controls.innerHTML = `
            <button type="button" class="btn btn-sm btn-outline-secondary" data-dir="up">Up</button>
            <button type="button" class="btn btn-sm btn-outline-secondary" data-dir="left">Left</button>
            <button type="button" class="btn btn-sm btn-outline-secondary" data-dir="down">Down</button>
            <button type="button" class="btn btn-sm btn-outline-secondary" data-dir="right">Right</button>
        `;

        const leaderboard = document.createElement("div");
        leaderboard.className = "game-leaderboard mt-2";
        leaderboard.innerHTML = `
            <h2 class="h6 mb-1">Snake Leaderboard</h2>
            <ol class="game-score-list mb-1"></ol>
            <small class="text-secondary game-score-note"></small>
        `;
        const scoreList = leaderboard.querySelector(".game-score-list");
        const scoreNote = leaderboard.querySelector(".game-score-note");

        container.appendChild(board);
        container.appendChild(status);
        container.appendChild(best);
        container.appendChild(reset);
        container.appendChild(pause);
        container.appendChild(controls);
        container.appendChild(leaderboard);

        let snake = [{ x: 6, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 7 }];
        let dir = { x: 1, y: 0 };
        let food = { x: 10, y: 7 };
        let timer = null;
        let score = 0;
        let running = true;
        let paused = false;
        let tickMs = 170;
        let submittedThisRun = false;

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
                    ? "Score saves automatically on game over."
                    : "Log in to publish your score.";
            } catch {
                scoreList.innerHTML = "<li>Could not load scores</li>";
                scoreNote.textContent = "";
            }
        }

        async function submitScoreIfNeeded() {
            if (submittedThisRun || score <= 0) return;
            const userKey = sessionStorage.getItem(SESSION_KEY);
            if (!userKey || !global.vosHeistApi || typeof global.vosHeistApi.submitGameScore !== "function") return;
            try {
                await global.vosHeistApi.submitGameScore(GAME_KEY, { userKey, score });
                submittedThisRun = true;
                await refreshLeaderboard();
            } catch {
                // Ignore leaderboard submission failures.
            }
        }

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
            if (!running || paused) return;
            const head = snake[0];
            const next = { x: head.x + dir.x, y: head.y + dir.y };

            if (
                next.x < 0 || next.y < 0 || next.x >= size || next.y >= size ||
                snake.some((s) => s.x === next.x && s.y === next.y)
            ) {
                running = false;
                render();
                submitScoreIfNeeded();
                return;
            }

            snake.unshift(next);
            if (next.x === food.x && next.y === food.y) {
                score += 1;
                if (score > bestScore) {
                    bestScore = score;
                    localStorage.setItem("vosheist-snake-best", String(bestScore));
                    best.textContent = `Best: ${bestScore}`;
                }
                // Make the game gradually faster.
                tickMs = Math.max(90, tickMs - 4);
                clearInterval(timer);
                timer = setInterval(step, tickMs);
                placeFood();
            } else {
                snake.pop();
            }
            render();
        }

        function setDirection(nextDir) {
            if (nextDir === "up" && dir.y !== 1) dir = { x: 0, y: -1 };
            if (nextDir === "down" && dir.y !== -1) dir = { x: 0, y: 1 };
            if (nextDir === "left" && dir.x !== 1) dir = { x: -1, y: 0 };
            if (nextDir === "right" && dir.x !== -1) dir = { x: 1, y: 0 };
        }

        function keyHandler(e) {
            if (e.key === "ArrowUp") setDirection("up");
            if (e.key === "ArrowDown") setDirection("down");
            if (e.key === "ArrowLeft") setDirection("left");
            if (e.key === "ArrowRight") setDirection("right");
            if (e.key === " ") {
                e.preventDefault();
                paused = !paused;
                pause.textContent = paused ? "Resume" : "Pause";
            }
        }

        function restart() {
            snake = [{ x: 6, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 7 }];
            dir = { x: 1, y: 0 };
            score = 0;
            running = true;
            paused = false;
            tickMs = 170;
            submittedThisRun = false;
            pause.textContent = "Pause";
            clearInterval(timer);
            timer = setInterval(step, tickMs);
            placeFood();
            render();
        }

        window.addEventListener("keydown", keyHandler);
        reset.addEventListener("click", restart);
        pause.addEventListener("click", () => {
            if (!running) return;
            paused = !paused;
            pause.textContent = paused ? "Resume" : "Pause";
        });
        controls.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-dir]");
            if (!btn) return;
            setDirection(btn.getAttribute("data-dir"));
        });

        timer = setInterval(step, tickMs);
        refreshLeaderboard();
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
