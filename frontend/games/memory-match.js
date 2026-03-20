/* Memory Match game (vanilla JS)
   Usage: MemoryMatchGame.init(containerElement)
*/
(function (global) {
    const SYMBOLS = ["🍎", "🍌", "🍇", "🍒", "🍉", "🍓", "🥝", "🍍"];

    function shuffle(arr) {
        const out = arr.slice();
        for (let i = out.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [out[i], out[j]] = [out[j], out[i]];
        }
        return out;
    }

    function init(container) {
        if (!container) return null;
        container.innerHTML = "";

        let cards = [];
        let open = [];
        let lock = false;
        let moves = 0;
        let matched = 0;

        const wrap = document.createElement("div");
        wrap.className = "mm-wrap";

        const top = document.createElement("div");
        top.className = "d-flex justify-content-between align-items-center mb-2";

        const info = document.createElement("small");
        info.className = "text-secondary";

        const reset = document.createElement("button");
        reset.className = "btn btn-sm btn-outline-secondary";
        reset.textContent = "Shuffle";

        top.appendChild(info);
        top.appendChild(reset);

        const grid = document.createElement("div");
        grid.className = "mm-grid";

        wrap.appendChild(top);
        wrap.appendChild(grid);
        container.appendChild(wrap);

        function updateInfo() {
            info.textContent = matched === SYMBOLS.length
                ? `Finished in ${moves} moves`
                : `Moves: ${moves}`;
        }

        function render() {
            grid.innerHTML = "";
            cards.forEach((card, idx) => {
                const btn = document.createElement("button");
                btn.className = `mm-card ${card.matched || card.open ? "is-open" : ""}`;
                btn.textContent = card.matched || card.open ? card.symbol : "?";
                btn.disabled = card.matched || lock;
                btn.addEventListener("click", () => onClick(idx));
                grid.appendChild(btn);
            });
            updateInfo();
        }

        function onClick(idx) {
            if (lock || cards[idx].matched || cards[idx].open) return;

            cards[idx].open = true;
            open.push(idx);
            render();

            if (open.length < 2) return;
            moves += 1;
            const [a, b] = open;

            if (cards[a].symbol === cards[b].symbol) {
                cards[a].matched = true;
                cards[b].matched = true;
                matched += 1;
                open = [];
                render();
                return;
            }

            lock = true;
            setTimeout(() => {
                cards[a].open = false;
                cards[b].open = false;
                open = [];
                lock = false;
                render();
            }, 700);
        }

        function resetGame() {
            const deck = shuffle([...SYMBOLS, ...SYMBOLS]);
            cards = deck.map((symbol) => ({ symbol, matched: false, open: false }));
            open = [];
            lock = false;
            moves = 0;
            matched = 0;
            render();
        }

        reset.addEventListener("click", resetGame);
        resetGame();

        return { reset: resetGame };
    }

    global.MemoryMatchGame = { init };
})(window);
