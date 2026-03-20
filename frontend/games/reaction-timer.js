/* Reaction Timer game
   Usage: ReactionTimerGame.init(containerElement)
*/
(function (global) {
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
        let bestValue = Number(localStorage.getItem("vosheist-reaction-best") || 0);
        best.textContent = bestValue ? `Best: ${bestValue} ms` : "Best: -";

        row.appendChild(start);
        row.appendChild(best);

        wrap.appendChild(panel);
        wrap.appendChild(row);
        container.appendChild(wrap);

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

            if (!bestValue || result < bestValue) {
                bestValue = result;
                localStorage.setItem("vosheist-reaction-best", String(bestValue));
                best.textContent = `Best: ${bestValue} ms`;
            }
        });

        return { reset };
    }

    global.ReactionTimerGame = { init };
})(window);
