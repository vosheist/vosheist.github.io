/* Quick Math game
   Usage: QuickMathGame.init(containerElement)
*/
(function (global) {
    const SESSION_KEY = "yeshivaChillCurrentUser";
    const GAME_KEY = "quick-math";

    function makeQuestion() {
        const a = 1 + Math.floor(Math.random() * 20);
        const b = 1 + Math.floor(Math.random() * 20);
        const ops = ["+", "-", "*"];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let answer = 0;
        if (op === "+") answer = a + b;
        if (op === "-") answer = a - b;
        if (op === "*") answer = a * b;
        return { text: `${a} ${op} ${b}`, answer };
    }

    function init(container) {
        if (!container) return null;
        container.innerHTML = "";

        let q = makeQuestion();
        let score = 0;

        const wrap = document.createElement("div");
        wrap.className = "qm-wrap";

        const question = document.createElement("p");
        question.className = "qm-question mb-2";

        const row = document.createElement("div");
        row.className = "d-flex gap-2 flex-wrap";

        const input = document.createElement("input");
        input.className = "form-control qm-input";
        input.type = "number";
        input.placeholder = "Answer";

        const submit = document.createElement("button");
        submit.className = "btn btn-outline-primary";
        submit.textContent = "Check";

        const skip = document.createElement("button");
        skip.className = "btn btn-outline-secondary";
        skip.textContent = "Skip";

        const status = document.createElement("small");
        status.className = "text-secondary d-block mt-2";

        const leaderboard = document.createElement("div");
        leaderboard.className = "game-leaderboard mt-2";
        leaderboard.innerHTML = `
            <h2 class="h6 mb-1">Quick Math Leaderboard</h2>
            <ol class="game-score-list mb-1"></ol>
            <small class="text-secondary game-score-note"></small>
        `;
        const scoreList = leaderboard.querySelector(".game-score-list");
        const scoreNote = leaderboard.querySelector(".game-score-note");

        row.appendChild(input);
        row.appendChild(submit);
        row.appendChild(skip);

        wrap.appendChild(question);
        wrap.appendChild(row);
        wrap.appendChild(status);
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
                    ? "Your best score is kept automatically."
                    : "Log in to publish your score.";
            } catch {
                scoreList.innerHTML = "<li>Could not load scores</li>";
                scoreNote.textContent = "";
            }
        }

        async function submitScore(currentScore) {
            if (currentScore <= 0) return;
            const userKey = sessionStorage.getItem(SESSION_KEY);
            if (!userKey || !global.yeshivaChillApi || typeof global.yeshivaChillApi.submitGameScore !== "function") return;
            try {
                await global.yeshivaChillApi.submitGameScore(GAME_KEY, { userKey, score: currentScore });
                await refreshLeaderboard();
            } catch {
                // Ignore leaderboard submission failures.
            }
        }

        function render() {
            question.textContent = `Solve: ${q.text}`;
            status.textContent = `Score: ${score}`;
        }

        function next() {
            q = makeQuestion();
            input.value = "";
            input.focus();
            render();
        }

        function check() {
            const val = Number(input.value);
            if (!Number.isFinite(val)) {
                status.textContent = `Enter a number. Score: ${score}`;
                return;
            }
            if (val === q.answer) {
                score += 1;
                status.textContent = `Correct! Score: ${score}`;
                submitScore(score);
            } else {
                status.textContent = `Nope (${q.answer}). Score: ${score}`;
            }
            setTimeout(next, 350);
        }

        submit.addEventListener("click", check);
        skip.addEventListener("click", next);
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                check();
            }
        });

        render();
        refreshLeaderboard();
        return { reset: () => { score = 0; next(); } };
    }

    global.QuickMathGame = { init };
})(window);
