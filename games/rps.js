/* Rock-Paper-Scissors module (vanilla JS)
   Usage: RpsGame.init(containerElement)
*/
(function (global) {
    const CHOICES = ["rock", "paper", "scissors"];
    const SESSION_KEY = "yeshivaChillCurrentUser";
    const GAME_KEY = "rps";

    function pickComputer() {
        return CHOICES[Math.floor(Math.random() * CHOICES.length)];
    }

    function winner(player, computer) {
        if (player === computer) return "draw";
        if (
            (player === "rock" && computer === "scissors") ||
            (player === "paper" && computer === "rock") ||
            (player === "scissors" && computer === "paper")
        ) {
            return "player";
        }
        return "computer";
    }

    function pretty(choice) {
        if (choice === "rock") return "Rock";
        if (choice === "paper") return "Paper";
        return "Scissors";
    }

    function init(container) {
        if (!container) return null;

        container.innerHTML = "";
        let playerScore = 0;
        let computerScore = 0;

        const wrap = document.createElement("div");
        wrap.className = "rps-wrap";

        const buttons = document.createElement("div");
        buttons.className = "d-flex flex-wrap gap-2 mb-2";

        const status = document.createElement("p");
        status.className = "mb-2 rps-status";
        status.textContent = "Choose your move";

        const score = document.createElement("small");
        score.className = "text-secondary";
        score.textContent = "You 0 : 0 Computer";

        const leaderboard = document.createElement("div");
        leaderboard.className = "game-leaderboard mt-2";
        leaderboard.innerHTML = `
            <h2 class="h6 mb-1">RPS Leaderboard</h2>
            <ol class="game-score-list mb-1"></ol>
            <small class="text-secondary game-score-note"></small>
        `;
        const scoreList = leaderboard.querySelector(".game-score-list");
        const scoreNote = leaderboard.querySelector(".game-score-note");

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
                    ? "Your best win count is saved."
                    : "Log in to publish your score.";
            } catch {
                scoreList.innerHTML = "<li>Could not load scores</li>";
                scoreNote.textContent = "";
            }
        }

        async function submitScore() {
            if (playerScore <= 0) return;
            const userKey = sessionStorage.getItem(SESSION_KEY);
            if (!userKey || !global.yeshivaChillApi || typeof global.yeshivaChillApi.submitGameScore !== "function") return;
            try {
                await global.yeshivaChillApi.submitGameScore(GAME_KEY, { userKey, score: playerScore });
                await refreshLeaderboard();
            } catch {
                // Ignore leaderboard submission failures.
            }
        }

        CHOICES.forEach((choice) => {
            const button = document.createElement("button");
            button.className = "btn btn-outline-primary";
            button.textContent = pretty(choice);
            button.addEventListener("click", () => {
                const computer = pickComputer();
                const result = winner(choice, computer);

                if (result === "player") {
                    playerScore += 1;
                    status.textContent = `You win: ${pretty(choice)} beats ${pretty(computer)}`;
                    status.className = "mb-2 rps-status text-success";
                } else if (result === "computer") {
                    computerScore += 1;
                    status.textContent = `Computer wins: ${pretty(computer)} beats ${pretty(choice)}`;
                    status.className = "mb-2 rps-status text-danger";
                } else {
                    status.textContent = `Draw: both chose ${pretty(choice)}`;
                    status.className = "mb-2 rps-status text-secondary";
                }

                score.textContent = `You ${playerScore} : ${computerScore} Computer`;
            });
            buttons.appendChild(button);
        });

        const reset = document.createElement("button");
        reset.className = "btn btn-outline-secondary btn-sm mt-2";
        reset.textContent = "Reset score";
        reset.addEventListener("click", () => {
            submitScore();
            playerScore = 0;
            computerScore = 0;
            status.textContent = "Choose your move";
            status.className = "mb-2 rps-status";
            score.textContent = "You 0 : 0 Computer";
        });

        wrap.appendChild(buttons);
        wrap.appendChild(status);
        wrap.appendChild(score);
        wrap.appendChild(reset);
        wrap.appendChild(leaderboard);
        container.appendChild(wrap);

        refreshLeaderboard();

        return { reset: () => reset.click() };
    }

    global.RpsGame = { init };
})(window);
