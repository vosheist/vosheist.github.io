/* Simple lane racer (single-player)
   Usage: LaneRacerGame.init(containerElement)
*/
(function (global) {
    const SESSION_KEY = "yeshivaChillCurrentUser";
    const GAME_KEY = "lane-racer";

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

        const best = document.createElement("small");
        best.className = "text-secondary d-block";
        let bestScore = Number(localStorage.getItem("yeshivachill-racer-best") || 0);
        best.textContent = `Best: ${bestScore}`;

        const reset = document.createElement("button");
        reset.className = "btn btn-outline-secondary btn-sm mt-2";
        reset.textContent = "Restart";

        const controls = document.createElement("div");
        controls.className = "d-flex gap-2 mt-2";
        controls.innerHTML = `
            <button type="button" class="btn btn-sm btn-outline-secondary" data-dir="left">Left</button>
            <button type="button" class="btn btn-sm btn-outline-secondary" data-dir="right">Right</button>
        `;

        const leaderboard = document.createElement("div");
        leaderboard.className = "game-leaderboard mt-2";
        leaderboard.innerHTML = `
            <h2 class="h6 mb-1">Lane Racer Leaderboard</h2>
            <ol class="game-score-list mb-1"></ol>
            <small class="text-secondary game-score-note"></small>
        `;
        const scoreList = leaderboard.querySelector(".game-score-list");
        const scoreNote = leaderboard.querySelector(".game-score-note");

        container.appendChild(board);
        container.appendChild(status);
        container.appendChild(best);
        container.appendChild(reset);
        container.appendChild(controls);
        container.appendChild(leaderboard);

        let playerLane = 1;
        let obstacles = [];
        let boosts = [];
        let ticks = 0;
        let running = true;
        let timer = null;
        let tickMs = 190;
        let submittedThisRun = false;

        async function refreshLeaderboard() {
            if (!global.yeshivaChillApi || typeof global.yeshivaChillApi.getGameScores !== "function") {
                scoreList.innerHTML = "<li>API unavailable</li>";
                scoreNote.textContent = "";
                return;
            }
            try {
                const payload = await global.yeshivaChillApi.getGameScores(GAME_KEY);
                const rows = Array.isArray(payload.scores) ? payload.scores : [];
                scoreList.innerHTML = rows.length
                    ? rows.slice(0, 8).map((row) => {
                        const name = row.nickname || row.displayName || row.userKey || "Player";
                        return `<li><span>${name}</span><strong>${row.score}</strong></li>`;
                    }).join("")
                    : "<li>No scores yet</li>";
                scoreNote.textContent = sessionStorage.getItem(SESSION_KEY)
                    ? "Score saves automatically when you crash."
                    : "Log in to publish your score.";
            } catch {
                scoreList.innerHTML = "<li>Could not load scores</li>";
                scoreNote.textContent = "";
            }
        }

        async function submitScoreIfNeeded() {
            if (submittedThisRun || ticks <= 0) return;
            const userKey = sessionStorage.getItem(SESSION_KEY);
            if (!userKey || !global.yeshivaChillApi || typeof global.yeshivaChillApi.submitGameScore !== "function") return;
            try {
                await global.yeshivaChillApi.submitGameScore(GAME_KEY, { userKey, score: ticks });
                submittedThisRun = true;
                await refreshLeaderboard();
            } catch {
                // Ignore leaderboard submission failures.
            }
        }

        function spawnObstacle() {
            obstacles.push({ lane: Math.floor(Math.random() * lanes), row: 0 });
        }

        function spawnBoost() {
            boosts.push({ lane: Math.floor(Math.random() * lanes), row: 0 });
        }

        function render() {
            board.innerHTML = "";
            for (let r = 0; r < rows; r++) {
                for (let l = 0; l < lanes; l++) {
                    const cell = document.createElement("div");
                    cell.className = "lr-cell";
                    const hasObstacle = obstacles.some((o) => o.row === r && o.lane === l);
                    const hasBoost = boosts.some((b) => b.row === r && b.lane === l);
                    const isPlayer = r === rows - 1 && l === playerLane;
                    if (hasObstacle) cell.classList.add("lr-obstacle");
                    if (hasBoost) cell.classList.add("lr-boost");
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
            if (ticks % 11 === 0) spawnBoost();
            if (ticks % 18 === 0) {
                tickMs = Math.max(110, tickMs - 6);
                clearInterval(timer);
                timer = setInterval(step, tickMs);
            }

            obstacles = obstacles.map((o) => ({ ...o, row: o.row + 1 })).filter((o) => o.row < rows);
            boosts = boosts.map((b) => ({ ...b, row: b.row + 1 })).filter((b) => b.row < rows);

            if (obstacles.some((o) => o.row === rows - 1 && o.lane === playerLane)) {
                running = false;
                if (ticks > bestScore) {
                    bestScore = ticks;
                    localStorage.setItem("yeshivachill-racer-best", String(bestScore));
                    best.textContent = `Best: ${bestScore}`;
                }
                render();
                submitScoreIfNeeded();
                return;
            }

            const boostIndex = boosts.findIndex((b) => b.row === rows - 1 && b.lane === playerLane);
            if (boostIndex >= 0) {
                boosts.splice(boostIndex, 1);
                ticks += 6;
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
            boosts = [];
            ticks = 0;
            running = true;
            tickMs = 190;
            submittedThisRun = false;
            clearInterval(timer);
            timer = setInterval(step, tickMs);
            render();
        }

        window.addEventListener("keydown", keyHandler);
        reset.addEventListener("click", restart);
        controls.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-dir]");
            if (!btn || !running) return;
            const dir = btn.getAttribute("data-dir");
            if (dir === "left") playerLane = Math.max(0, playerLane - 1);
            if (dir === "right") playerLane = Math.min(lanes - 1, playerLane + 1);
            render();
        });
        timer = setInterval(step, tickMs);
        refreshLeaderboard();
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
