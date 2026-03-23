/* Number Guess game module (vanilla JS)
   Usage: NumberGuessGame.init(containerElement)
*/
(function (global) {
    const SESSION_KEY = "yeshivaChillCurrentUser";
    const GAME_KEY = "number-guess";

    function init(container) {
        if (!container) {
            return null;
        }

        container.innerHTML = "";
        let target = Math.floor(Math.random() * 100) + 1;
        let attempts = 0;

        const wrap = document.createElement("div");
        wrap.className = "ng-wrap";

        const status = document.createElement("p");
        status.className = "ng-status mb-2";
        status.textContent = "Guess a number from 1 to 100";

        const row = document.createElement("div");
        row.className = "d-flex gap-2 flex-wrap";

        const input = document.createElement("input");
        input.className = "form-control ng-input";
        input.type = "number";
        input.min = "1";
        input.max = "100";
        input.placeholder = "1-100";

        const submit = document.createElement("button");
        submit.className = "btn btn-outline-primary";
        submit.textContent = "Guess";

        const reset = document.createElement("button");
        reset.className = "btn btn-outline-secondary";
        reset.textContent = "New";

        const attemptsEl = document.createElement("small");
        attemptsEl.className = "text-secondary";
        attemptsEl.textContent = "Attempts: 0";

        const leaderboard = document.createElement("div");
        leaderboard.className = "game-leaderboard mt-2";
        leaderboard.innerHTML = `
            <h2 class="h6 mb-1">Number Guess Leaderboard</h2>
            <ol class="game-score-list mb-1"></ol>
            <small class="text-secondary game-score-note"></small>
        `;
        const scoreList = leaderboard.querySelector(".game-score-list");
        const scoreNote = leaderboard.querySelector(".game-score-note");

        row.appendChild(input);
        row.appendChild(submit);
        row.appendChild(reset);
        wrap.appendChild(status);
        wrap.appendChild(row);
        wrap.appendChild(attemptsEl);
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
                    ? "Higher points means fewer guesses."
                    : "Log in to publish your score.";
            } catch {
                scoreList.innerHTML = "<li>Could not load scores</li>";
                scoreNote.textContent = "";
            }
        }

        async function submitScore(attemptCount) {
            const userKey = sessionStorage.getItem(SESSION_KEY);
            if (!userKey || !global.yeshivaChillApi || typeof global.yeshivaChillApi.submitGameScore !== "function") return;
            const points = Math.max(1, 101 - attemptCount);
            try {
                await global.yeshivaChillApi.submitGameScore(GAME_KEY, { userKey, score: points });
                await refreshLeaderboard();
            } catch {
                // Ignore leaderboard submission failures.
            }
        }

        function setStatus(text, cls) {
            status.textContent = text;
            status.classList.remove("text-danger", "text-success", "text-secondary");
            if (cls) {
                status.classList.add(cls);
            }
        }

        function doGuess() {
            const value = Number(input.value);
            if (!Number.isInteger(value) || value < 1 || value > 100) {
                setStatus("Enter a valid number (1-100)", "text-danger");
                return;
            }

            attempts += 1;
            attemptsEl.textContent = `Attempts: ${attempts}`;

            if (value === target) {
                setStatus(`Correct! It was ${target}.`, "text-success");
                submitScore(attempts);
                return;
            }

            if (value < target) {
                setStatus("Too low", "text-secondary");
            } else {
                setStatus("Too high", "text-secondary");
            }
        }

        function doReset() {
            target = Math.floor(Math.random() * 100) + 1;
            attempts = 0;
            input.value = "";
            attemptsEl.textContent = "Attempts: 0";
            setStatus("Guess a number from 1 to 100");
            input.focus();
        }

        submit.addEventListener("click", doGuess);
        reset.addEventListener("click", doReset);
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                doGuess();
            }
        });

        refreshLeaderboard();

        return {
            reset: doReset
        };
    }

    global.NumberGuessGame = { init };
})(window);
