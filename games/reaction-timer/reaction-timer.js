/* Reaction Timer game
   Usage: ReactionTimerGame.init(containerElement)
*/
(function (global) {
    const SESSION_KEY = "yeshivaChillCurrentUser";
    const GAME_KEY = "reaction-timer";

    function init(container) {
        if (!container) return null;
        container.innerHTML = "";

        let phase = "idle";
        let startAt = 0;
        let timeoutId = null;

        const wrap = document.createElement("div");
        wrap.className = "rt-wrap";

        const panel = document.createElement("button");
        panel.className = "rt-panel";
        panel.type = "button";
        panel.textContent = "Press Start";

        const row = document.createElement("div");
        row.className = "d-flex gap-2 mt-2 flex-wrap";

        const start = document.createElement("button");
        start.className = "btn btn-outline-primary";
        start.textContent = "Start";

        const best = document.createElement("small");
        best.className = "text-secondary";
        let bestValue = Number(localStorage.getItem("yeshivachill-reaction-best") || 0);
        best.textContent = bestValue ? `Best: ${bestValue} ms` : "Best: -";

        const leaderboard = document.createElement("div");
        leaderboard.className = "game-leaderboard mt-2";
        leaderboard.innerHTML = `
            <h2 class="h6 mb-1">Reaction Leaderboard</h2>
            <ol class="game-score-list mb-1"></ol>
            <small class="text-secondary game-score-note"></small>
        `;
        const scoreList = leaderboard.querySelector(".game-score-list");
        const scoreNote = leaderboard.querySelector(".game-score-note");

        row.appendChild(start);
        row.appendChild(best);

        wrap.appendChild(panel);
        wrap.appendChild(row);
        wrap.appendChild(leaderboard);
        container.appendChild(wrap);

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
                    ? "Higher points means faster reaction."
                    : "Log in to publish your score.";
            } catch {
                scoreList.innerHTML = "<li>Could not load scores</li>";
                scoreNote.textContent = "";
            }
        }

        async function submitScore(resultMs) {
            const userKey = sessionStorage.getItem(SESSION_KEY);
            if (!userKey || !global.yeshivaChillApi || typeof global.yeshivaChillApi.submitGameScore !== "function") return;
            const points = Math.max(1, 2000 - resultMs);
            try {
                await global.yeshivaChillApi.submitGameScore(GAME_KEY, { userKey, score: points });
                await refreshLeaderboard();
            } catch {
                // Ignore leaderboard submission failures.
            }
        }

        function setPanel(text, cls) {
            panel.textContent = text;
            panel.className = `rt-panel ${cls || ""}`.trim();
        }

        function reset() {
            phase = "idle";
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            setPanel("Press Start", "");
        }

        start.addEventListener("click", () => {
            reset();
            phase = "waiting";
            setPanel("Wait for green...", "rt-wait");
            timeoutId = setTimeout(() => {
                phase = "ready";
                startAt = performance.now();
                setPanel("CLICK!", "rt-ready");
            }, 1200 + Math.random() * 1800);
        });

        panel.addEventListener("click", () => {
            if (phase === "waiting") {
                reset();
                setPanel("Too soon! Press Start", "rt-bad");
                return;
            }
            if (phase !== "ready") return;

            const result = Math.round(performance.now() - startAt);
            phase = "idle";
            setPanel(`${result} ms`, "rt-good");
            submitScore(result);

            if (!bestValue || result < bestValue) {
                bestValue = result;
                localStorage.setItem("yeshivachill-reaction-best", String(bestValue));
                best.textContent = `Best: ${bestValue} ms`;
            }
        });

        refreshLeaderboard();

        return { reset };
    }

    global.ReactionTimerGame = { init };
})(window);
