/* Quick Math game
   Usage: QuickMathGame.init(containerElement)
*/
(function (global) {
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

        row.appendChild(input);
        row.appendChild(submit);
        row.appendChild(skip);

        wrap.appendChild(question);
        wrap.appendChild(row);
        wrap.appendChild(status);
        container.appendChild(wrap);

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
        return { reset: () => { score = 0; next(); } };
    }

    global.QuickMathGame = { init };
})(window);
