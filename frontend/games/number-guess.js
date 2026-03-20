/* Number Guess game module (vanilla JS)
   Usage: NumberGuessGame.init(containerElement)
*/
(function (global) {
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

        row.appendChild(input);
        row.appendChild(submit);
        row.appendChild(reset);
        wrap.appendChild(status);
        wrap.appendChild(row);
        wrap.appendChild(attemptsEl);
        container.appendChild(wrap);

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

        return {
            reset: doReset
        };
    }

    global.NumberGuessGame = { init };
})(window);
