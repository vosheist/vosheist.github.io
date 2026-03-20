/* Rock-Paper-Scissors module (vanilla JS)
   Usage: RpsGame.init(containerElement)
*/
(function (global) {
    const CHOICES = ["rock", "paper", "scissors"];

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
        container.appendChild(wrap);

        return { reset: () => reset.click() };
    }

    global.RpsGame = { init };
})(window);
