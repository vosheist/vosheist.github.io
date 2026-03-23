(() => {
    const SESSION_KEY = "yeshivaChillCurrentUser";
    const LOGIN_PAGE = "nafshi.html";
    const PUBLIC_PAGES = new Set(["index.html", "nafshi.html"]);

    function getCurrentPageName() {
        const path = window.location.pathname || "";
        const fileName = path.split("/").pop();
        return fileName || "index.html";
    }

    function enforceMemberAccess() {
        const currentPage = getCurrentPageName().toLowerCase();
        const isLoggedIn = Boolean(sessionStorage.getItem(SESSION_KEY));

        if (!isLoggedIn && !PUBLIC_PAGES.has(currentPage)) {
            window.location.href = LOGIN_PAGE;
            return false;
        }

        return true;
    }

    function syncNavbarScrollState() {
        const navbarShell = document.getElementById("my-navbar");
        if (!navbarShell) {
            return;
        }

        if (window.scrollY > 24) {
            navbarShell.classList.add("nav-scrolled");
        } else {
            navbarShell.classList.remove("nav-scrolled");
        }
    }

    function syncAccountShortcut() {
        const shortcuts = document.querySelectorAll(".js-account-shortcut");
        if (!shortcuts.length) {
            return;
        }

        const isLoggedIn = Boolean(sessionStorage.getItem(SESSION_KEY));
        shortcuts.forEach((shortcut) => {
            if (isLoggedIn) {
                shortcut.classList.remove("d-none");
                shortcut.setAttribute("href", "account.html");
            } else {
                shortcut.classList.add("d-none");
                shortcut.setAttribute("href", "nafshi.html");
            }
        });
    }

    function syncGuestNavTargets() {
        const isLoggedIn = Boolean(sessionStorage.getItem(SESSION_KEY));
        const navLinks = document.querySelectorAll("#my-navbar .navbar-nav .nav-link");

        navLinks.forEach((link) => {
            const href = link.getAttribute("href") || "";
            if (!href || href === LOGIN_PAGE || href.startsWith("#")) {
                return;
            }

            if (!link.dataset.memberHref) {
                link.dataset.memberHref = href;
            }

            if (isLoggedIn) {
                const target = link.dataset.memberHref;
                if (target) {
                    link.setAttribute("href", target);
                }
                return;
            }

            link.setAttribute("href", LOGIN_PAGE);
        });
    }

    window.addEventListener("scroll", syncNavbarScrollState, { passive: true });
    window.addEventListener("load", () => {
        if (!enforceMemberAccess()) {
            return;
        }

        syncNavbarScrollState();
        syncAccountShortcut();
        syncGuestNavTargets();
    });
})();

// Password visibility toggle
(function () {
    var EYE = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg>';
    var EYE_SLASH = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/></svg>';
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.pw-toggle');
        if (!btn) return;
        var group = btn.closest('.pw-wrap') || btn.closest('.input-group');
        if (!group) return;
        var input = group.querySelector('input');
        if (!input) return;
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = show ? EYE_SLASH : EYE;
        btn.setAttribute('aria-label', show ? 'הסתר קאוד' : 'הראה קאוד');
    });
})();

// Game help + demo panel
(function () {
    var HELP = {
        "game-2048.html": {
            steps: [
                "Use arrow keys to slide all tiles.",
                "Matching numbers merge into one bigger tile.",
                "Keep space open so you do not get stuck."
            ],
            demo: "Demo: Left -> Up -> Left -> Down to build early merges in one corner."
        },
        "game-tictactoe.html": {
            steps: [
                "Click any empty square to place X.",
                "Computer responds with O.",
                "Get 3 in a row to win."
            ],
            demo: "Demo: Start from center, then take opposite corners when available."
        },
        "game-connect4.html": {
            steps: [
                "Click a column to drop your piece.",
                "Computer drops after your move.",
                "Connect 4 in a row horizontally, vertically, or diagonally."
            ],
            demo: "Demo: Build 3 in a row on the bottom, then force a double-threat move."
        },
        "game-snake.html": {
            steps: [
                "Use arrow keys to move the snake.",
                "Eat food to grow and increase score.",
                "Do not hit walls or your own body."
            ],
            demo: "Demo: Move in a wide loop first: Right -> Down -> Left -> Up."
        },
        "game-lane-racer.html": {
            steps: [
                "Use left/right arrows to switch lanes.",
                "Avoid red obstacle blocks.",
                "Survive longer to raise score."
            ],
            demo: "Demo: Stay in middle lane until danger appears, then switch once."
        },
        "game-memory-match.html": {
            steps: [
                "Click cards to reveal symbols.",
                "Match pairs before the board resets your memory.",
                "Clear all pairs to finish."
            ],
            demo: "Demo: Open cards left-to-right on first pass, then match remembered pairs."
        },
        "game-reaction-timer.html": {
            steps: [
                "Press start and wait for green state.",
                "Click immediately when ready signal appears.",
                "If you click too early, round is invalid."
            ],
            demo: "Demo: Keep mouse centered and click only on color switch to green."
        },
        "game-quick-math.html": {
            steps: [
                "Solve each math question quickly.",
                "Submit answers before timer runs down.",
                "Chain correct answers for better score."
            ],
            demo: "Demo: Estimate first, then type exact answer fast."
        },
        "game-number-guess.html": {
            steps: [
                "Guess the hidden number.",
                "Use high/low feedback to narrow the range.",
                "Find it in as few guesses as possible."
            ],
            demo: "Demo: Start at 50, then halve interval (25/75 etc.) like binary search."
        },
        "game-rps.html": {
            steps: [
                "Pick rock, paper, or scissors.",
                "Computer reveals its choice.",
                "Track streaks and adapt your picks."
            ],
            demo: "Demo: Try 5 rounds and switch after every loss."
        }
    };

    function currentFileName() {
        var path = window.location.pathname || "";
        return (path.split("/").pop() || "").toLowerCase();
    }

    function createHelpPanel(info, id) {
        var section = document.createElement("section");
        section.className = "mt-3";

        var steps = info.steps.map(function (step) {
            return "<li>" + step + "</li>";
        }).join("");

        section.innerHTML = [
            '<button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#' + id + '" aria-expanded="false" aria-controls="' + id + '">How to Play + Demo</button>',
            '<div id="' + id + '" class="collapse mt-2">',
            '<div class="p-2 border rounded bg-light-subtle">',
            '<ol class="mb-2 ps-3">' + steps + '</ol>',
            '<p class="mb-0 small text-secondary"><strong>Demo:</strong> ' + info.demo + '</p>',
            '</div>',
            '</div>'
        ].join("");

        return section;
    }

    document.addEventListener("DOMContentLoaded", function () {
        var fileName = currentFileName();
        var info = HELP[fileName];
        if (!info) return;

        var gameCard = document.querySelector("article.game-card");
        if (!gameCard) return;

        var panelId = "game-help-" + fileName.replace(/[^a-z0-9]/g, "-");
        gameCard.appendChild(createHelpPanel(info, panelId));
    });
})();
