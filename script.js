(() => {
    const SESSION_KEY = "vosHeistCurrentUser";

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
                shortcut.setAttribute("href", "NAFSHI.HTML");
            }
        });
    }

    window.addEventListener("scroll", syncNavbarScrollState, { passive: true });
    window.addEventListener("load", () => {
        syncNavbarScrollState();
        syncAccountShortcut();
    });
})();
