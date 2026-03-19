(() => {
    const SESSION_KEY = "vosHeistCurrentUser";
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
