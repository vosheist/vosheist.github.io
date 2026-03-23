(() => {
    const SESSION_KEY = "yeshivaChillCurrentUser";
    function routeTo(page) {
        const path = (window.location.pathname || "").toLowerCase();
        const inFrontendDir = path.includes("/frontend/");
        return inFrontendDir ? page : `frontend/${page}`;
    }

    const LOGIN_PAGE = routeTo("nafshi.html");
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
                shortcut.setAttribute("href", routeTo("account.html"));
            } else {
                shortcut.classList.add("d-none");
                shortcut.setAttribute("href", routeTo("nafshi.html"));
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
            demo: "Demo: Left -> Up -> Left -> Down to build early merges in one corner.",
            challenge: "Build a steady merge rhythm and reach 120 focus XP in one run.",
            targetXp: 120,
            tips: ["Keep your highest tile near a corner.", "Avoid full rows with mixed values.", "Plan 2 moves ahead before swiping."]
        },
        "game-tictactoe.html": {
            steps: [
                "Click any empty square to place X.",
                "Computer responds with O.",
                "Get 3 in a row to win."
            ],
            demo: "Demo: Start from center, then take opposite corners when available.",
            challenge: "Play with tempo: hit 75 focus XP while keeping streak momentum.",
            targetXp: 75,
            tips: ["Center gives the most fork opportunities.", "Block double-threats before attacking.", "Corners are stronger than edges."]
        },
        "game-connect4.html": {
            steps: [
                "Click a column to drop your piece.",
                "Computer drops after your move.",
                "Connect 4 in a row horizontally, vertically, or diagonally."
            ],
            demo: "Demo: Build 3 in a row on the bottom, then force a double-threat move.",
            challenge: "Control the center lane and push to 95 focus XP.",
            targetXp: 95,
            tips: ["Center columns unlock more diagonal paths.", "Set traps where two wins open at once.", "Do not hand free vertical stacks."]
        },
        "game-snake.html": {
            steps: [
                "Use arrow keys to move the snake.",
                "Eat food to grow and increase score.",
                "Do not hit walls or your own body."
            ],
            demo: "Demo: Move in a wide loop first: Right -> Down -> Left -> Up.",
            challenge: "Maintain flow and break 140 focus XP in one session.",
            targetXp: 140,
            tips: ["Create long safe lanes before chasing food.", "Avoid tight U-turns in late game.", "Use wall tracking to reduce panic turns."]
        },
        "game-lane-racer.html": {
            steps: [
                "Use left/right arrows to switch lanes.",
                "Avoid red obstacle blocks.",
                "Survive longer to raise score."
            ],
            demo: "Demo: Stay in middle lane until danger appears, then switch once.",
            challenge: "Drive cleanly and clear 110 focus XP.",
            targetXp: 110,
            tips: ["Middle lane gives the best reaction window.", "Switch once, then stabilize.", "Avoid over-correcting across lanes."]
        },
        "game-memory-match.html": {
            steps: [
                "Click cards to reveal symbols.",
                "Match pairs before the board resets your memory.",
                "Clear all pairs to finish."
            ],
            demo: "Demo: Open cards left-to-right on first pass, then match remembered pairs.",
            challenge: "Build recall speed and reach 85 focus XP.",
            targetXp: 85,
            tips: ["Use a scan pattern instead of random flips.", "Lock pair positions mentally by row.", "Prefer confident matches before exploration."]
        },
        "game-reaction-timer.html": {
            steps: [
                "Press start and wait for green state.",
                "Click immediately when ready signal appears.",
                "If you click too early, round is invalid."
            ],
            demo: "Demo: Keep mouse centered and click only on color switch to green.",
            challenge: "Chain smooth rounds and push to 90 focus XP.",
            targetXp: 90,
            tips: ["Relax your grip before each round.", "Watch color, not text.", "Reset quickly after an early click."]
        },
        "game-quick-math.html": {
            steps: [
                "Solve each math question quickly.",
                "Submit answers before timer runs down.",
                "Chain correct answers for better score."
            ],
            demo: "Demo: Estimate first, then type exact answer fast.",
            challenge: "Balance speed and accuracy to hit 100 focus XP.",
            targetXp: 100,
            tips: ["Estimate sign and size before final answer.", "Break hard sums into chunks.", "Keep a steady answer rhythm."]
        },
        "game-number-guess.html": {
            steps: [
                "Guess the hidden number.",
                "Use high/low feedback to narrow the range.",
                "Find it in as few guesses as possible."
            ],
            demo: "Demo: Start at 50, then halve interval (25/75 etc.) like binary search.",
            challenge: "Use sharp narrowing logic and earn 80 focus XP.",
            targetXp: 80,
            tips: ["Binary search is your fastest strategy.", "Track min and max mentally every guess.", "Do not repeat near-duplicate guesses."]
        },
        "game-rps.html": {
            steps: [
                "Pick rock, paper, or scissors.",
                "Computer reveals its choice.",
                "Track streaks and adapt your picks."
            ],
            demo: "Demo: Try 5 rounds and switch after every loss.",
            challenge: "Read momentum patterns and achieve 70 focus XP.",
            targetXp: 70,
            tips: ["Do not repeat predictable triples.", "After a loss, vary tempo and pick.", "Track 3-round tendencies."]
        }
    };

    var ACTION_BADGES = [
        { threshold: 10, label: "Warm Hands" },
        { threshold: 25, label: "Locked In" },
        { threshold: 50, label: "Arcade Flow" },
        { threshold: 90, label: "Elite Focus" }
    ];

    function currentFileName() {
        var path = window.location.pathname || "";
        return (path.split("/").pop() || "").toLowerCase();
    }

    function formatDuration(totalSeconds) {
        var min = Math.floor(totalSeconds / 60);
        var sec = totalSeconds % 60;
        return String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
    }

    function createHelpPanel(info, id, stateKey) {
        var section = document.createElement("section");
        section.className = "mt-3 game-companion";

        var steps = info.steps.map(function (step) {
            return "<li>" + step + "</li>";
        }).join("");

        section.innerHTML = [
            '<div class="game-companion-shell">',
            '<div class="game-companion-head">',
            '<h2 class="game-companion-title">Game Companion</h2>',
            '<span class="game-companion-target">Challenge Target: ' + info.targetXp + ' XP</span>',
            '</div>',
            '<p class="game-companion-challenge mb-2">' + info.challenge + '</p>',
            '<div class="game-companion-actions mb-2">',
            '<button type="button" class="btn btn-sm btn-primary js-focus-toggle">Start Focus Run</button>',
            '<button type="button" class="btn btn-sm btn-outline-secondary js-focus-reset">Reset Session</button>',
            '<button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#' + id + '" aria-expanded="false" aria-controls="' + id + '">How to Play + Demo</button>',
            '</div>',
            '<div class="game-companion-stats">',
            '<div class="game-stat-box"><span class="game-stat-label">Time</span><strong class="js-stat-time">00:00</strong></div>',
            '<div class="game-stat-box"><span class="game-stat-label">Actions</span><strong class="js-stat-actions">0</strong></div>',
            '<div class="game-stat-box"><span class="game-stat-label">Streak</span><strong class="js-stat-streak">0</strong></div>',
            '<div class="game-stat-box"><span class="game-stat-label">Focus XP</span><strong class="js-stat-xp">0</strong></div>',
            '</div>',
            '<div class="game-companion-tip mt-2"><strong>Live Tip:</strong> <span class="js-live-tip"></span></div>',
            '<div class="game-companion-progress mt-2"><span class="js-progress-text"></span></div>',
            '<div class="game-companion-badges mt-2 js-badges"></div>',
            '<div id="' + id + '" class="collapse mt-2">',
            '<div class="p-2 border rounded bg-light-subtle">',
            '<ol class="mb-2 ps-3">' + steps + '</ol>',
            '<p class="mb-0 small text-secondary"><strong>Demo:</strong> ' + info.demo + '</p>',
            '</div>',
            '</div>',
            '</div>'
        ].join("");

        var toggleBtn = section.querySelector(".js-focus-toggle");
        var resetBtn = section.querySelector(".js-focus-reset");
        var timeEl = section.querySelector(".js-stat-time");
        var actionsEl = section.querySelector(".js-stat-actions");
        var streakEl = section.querySelector(".js-stat-streak");
        var xpEl = section.querySelector(".js-stat-xp");
        var tipEl = section.querySelector(".js-live-tip");
        var progressEl = section.querySelector(".js-progress-text");
        var badgeEl = section.querySelector(".js-badges");

        var state = {
            isRunning: false,
            elapsedBase: 0,
            startedAt: 0,
            actions: 0,
            streak: 0,
            bestStreak: 0,
            bestXp: 0,
            lastActionAt: 0,
            awarded: {}
        };

        try {
            var raw = localStorage.getItem(stateKey);
            if (raw) {
                var saved = JSON.parse(raw);
                if (saved && typeof saved === "object") {
                    state.bestStreak = Number(saved.bestStreak || 0);
                    state.bestXp = Number(saved.bestXp || 0);
                }
            }
        } catch {
            // Ignore storage errors.
        }

        function getElapsed() {
            if (!state.isRunning) return state.elapsedBase;
            return state.elapsedBase + Math.max(0, Math.floor((Date.now() - state.startedAt) / 1000));
        }

        function getXp() {
            var elapsed = getElapsed();
            return Math.round((elapsed * 0.9) + (state.actions * 1.6) + (state.streak * 2.3));
        }

        function saveState() {
            try {
                localStorage.setItem(stateKey, JSON.stringify({
                    bestStreak: state.bestStreak,
                    bestXp: state.bestXp
                }));
            } catch {
                // Ignore storage errors.
            }
        }

        function renderBadges() {
            var html = ACTION_BADGES
                .filter(function (b) { return state.awarded[b.threshold]; })
                .map(function (b) { return '<span class="game-badge">' + b.label + '</span>'; })
                .join("");
            badgeEl.innerHTML = html || '<span class="text-secondary small">Unlock badges by staying active in this run.</span>';
        }

        function render() {
            var elapsed = getElapsed();
            var xp = getXp();
            if (xp > state.bestXp) state.bestXp = xp;
            if (state.streak > state.bestStreak) state.bestStreak = state.streak;

            timeEl.textContent = formatDuration(elapsed);
            actionsEl.textContent = String(state.actions);
            streakEl.textContent = String(state.streak);
            xpEl.textContent = String(xp);

            var completed = xp >= info.targetXp;
            progressEl.textContent = completed
                ? "Challenge complete. Keep pushing for a new personal focus record."
                : ("Challenge progress: " + xp + " / " + info.targetXp + " XP");
            progressEl.className = completed
                ? "js-progress-text game-progress-ok"
                : "js-progress-text";

            renderBadges();
            saveState();
        }

        function startRun() {
            if (state.isRunning) return;
            state.isRunning = true;
            state.startedAt = Date.now();
            toggleBtn.textContent = "Pause Focus Run";
        }

        function pauseRun() {
            if (!state.isRunning) return;
            state.elapsedBase = getElapsed();
            state.isRunning = false;
            toggleBtn.textContent = "Resume Focus Run";
            render();
        }

        function resetRun() {
            state.isRunning = false;
            state.elapsedBase = 0;
            state.startedAt = 0;
            state.actions = 0;
            state.streak = 0;
            state.lastActionAt = 0;
            state.awarded = {};
            toggleBtn.textContent = "Start Focus Run";
            render();
        }

        function registerAction() {
            if (!state.isRunning) {
                startRun();
            }

            var now = Date.now();
            state.actions += 1;
            if (state.lastActionAt && (now - state.lastActionAt) <= 2200) {
                state.streak += 1;
            } else {
                state.streak = 1;
            }
            state.lastActionAt = now;

            ACTION_BADGES.forEach(function (badge) {
                if (state.actions >= badge.threshold) {
                    state.awarded[badge.threshold] = true;
                }
            });

            render();
        }

        var tipIndex = 0;
        tipEl.textContent = (info.tips && info.tips.length) ? info.tips[0] : "Stay calm and keep your rhythm.";

        toggleBtn.addEventListener("click", function () {
            if (state.isRunning) {
                pauseRun();
            } else {
                startRun();
            }
            render();
        });

        resetBtn.addEventListener("click", function () {
            resetRun();
        });

        var tick = setInterval(function () {
            if (state.isRunning) {
                render();
            }
            if (state.isRunning && state.lastActionAt && (Date.now() - state.lastActionAt) > 6000) {
                state.streak = 0;
            }
        }, 1000);

        var tipTicker = setInterval(function () {
            var tips = info.tips || [];
            if (!tips.length) return;
            tipIndex = (tipIndex + 1) % tips.length;
            tipEl.textContent = tips[tipIndex];
        }, 7000);

        function handleGameCardClick(event) {
            if (!event.target) return;
            if (event.target.closest("#" + id)) return;
            if (event.target.closest("button") || event.target.closest("input") || event.target.closest(".game-root") || event.target.closest(".ttt-cell") || event.target.closest(".snake-cell") || event.target.closest(".lr-cell") || event.target.closest(".g2048-tile")) {
                registerAction();
            }
        }

        function handleKeydown(event) {
            var targetTag = event.target && event.target.tagName ? String(event.target.tagName).toLowerCase() : "";
            if (targetTag === "input" || targetTag === "textarea") return;

            if (event.key === "?" || (event.shiftKey && event.key === "/")) {
                var helpBtn = section.querySelector('[data-bs-target="#' + id + '"]');
                if (helpBtn) {
                    helpBtn.click();
                }
                return;
            }

            if (["Shift", "Control", "Alt", "Meta", "Tab"].indexOf(event.key) === -1) {
                registerAction();
            }
        }

        var gameCardEl = document.querySelector("article.game-card");
        if (gameCardEl) {
            gameCardEl.addEventListener("click", handleGameCardClick);
        }
        document.addEventListener("keydown", handleKeydown);

        window.addEventListener("beforeunload", function () {
            clearInterval(tick);
            clearInterval(tipTicker);
            if (gameCardEl) {
                gameCardEl.removeEventListener("click", handleGameCardClick);
            }
            document.removeEventListener("keydown", handleKeydown);
        });

        render();

        return section;
    }

    document.addEventListener("DOMContentLoaded", function () {
        var fileName = currentFileName();
        var info = HELP[fileName];
        if (!info) return;

        var gameCard = document.querySelector("article.game-card");
        if (!gameCard) return;

        var panelId = "game-help-" + fileName.replace(/[^a-z0-9]/g, "-");
        var stateKey = "yeshivaChillGameCompanion." + fileName;
        var panel = createHelpPanel(info, panelId, stateKey);
        gameCard.appendChild(panel);
    });
})();
