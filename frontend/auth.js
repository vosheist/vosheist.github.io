(() => {
    const SESSION_KEY = "vosHeistCurrentUser";
    const SIGNUP_NOTIFY_ENDPOINT = "http://localhost:3000/api/notify-signup";

    function normalizeName(name) {
        return name.trim().toLowerCase();
    }

    function normalizeNickname(nickname) {
        return nickname.trim().toLowerCase();
    }

    async function hashPassword(password) {
        if (window.crypto && window.crypto.subtle) {
            const data = new TextEncoder().encode(password);
            const digest = await window.crypto.subtle.digest("SHA-256", data);
            return Array.from(new Uint8Array(digest))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
        }

        return password;
    }

    function showMessage(element, text, type) {
        if (!element) {
            return;
        }

        element.textContent = text;
        element.classList.remove("error", "success");
        if (type) {
            element.classList.add(type);
        }
    }

    async function notifyOwnerOnSignup(newUser) {
        if (!SIGNUP_NOTIFY_ENDPOINT) {
            return { sent: false, reason: "missing-endpoint" };
        }

        const payload = {
            event: "new_signup",
            displayName: newUser.displayName,
            nickname: newUser.nickname,
            email: newUser.email,
            createdAt: new Date().toISOString(),
            source: "vos-heist"
        };

        try {
            const response = await fetch(SIGNUP_NOTIFY_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                return { sent: false, reason: `http-${response.status}` };
            }

            return { sent: true };
        } catch {
            return { sent: false, reason: "network-error" };
        }
    }

    function wireCreateAccountForm() {
        const createForm = document.getElementById("create-account-form");
        if (!createForm) {
            return;
        }

        createForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const createMessage = document.getElementById("create-message");
            const firstnameInput = document.getElementById("create-firstname");
            const lastnameInput = document.getElementById("create-lastname");
            const nicknameInput = document.getElementById("create-nickname");
            const emailInput = document.getElementById("create-email");
            const passwordInput = document.getElementById("create-password");
            const confirmInput = document.getElementById("create-password-confirm");

            if (!firstnameInput || !lastnameInput || !nicknameInput || !emailInput || !passwordInput || !confirmInput) {
                return;
            }

            const firstname = firstnameInput.value.trim();
            const lastname = lastnameInput.value.trim();
            const displayName = `${firstname} ${lastname}`.trim();
            const nickname = nicknameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const userKey = normalizeName(displayName);

            if (!userKey) {
                showMessage(createMessage, "לייג אריין אלע נאמען פעלדער.", "error");
                return;
            }

            if (!nickname || nickname.length < 2) {
                showMessage(createMessage, "לייג אריין א פען נאמען (מינימום 2 אותיות).", "error");
                return;
            }

            if (!email || !email.includes("@")) {
                showMessage(createMessage, "לייג אריין א גילטיקן אימעיל.", "error");
                return;
            }

            if (password.length < 4) {
                showMessage(createMessage, "קאוד דארף האבן 4 אותיות אדער מער.", "error");
                return;
            }

            if (password !== confirmInput.value) {
                showMessage(createMessage, "ביידע קאודס דארפן זיין די זעלבע.", "error");
                return;
            }

            const newUser = {
                displayName,
                firstname,
                lastname,
                nickname,
                email,
                records: [],
                passwordHash: await hashPassword(password)
            };

            try {
                await window.vosHeistApi.signup(newUser);
            } catch (error) {
                const message = String(error.message || "").toLowerCase();
                if (message.includes("nickname")) {
                    showMessage(createMessage, "דער פען נאמען איז שוין פארנומען.", "error");
                    return;
                }
                if (message.includes("exists") || message.includes("user")) {
                    showMessage(createMessage, "דער נאמען איז שוין פארנומען.", "error");
                    return;
                }
                showMessage(createMessage, "קאנעקשען פראבלעם. פרוביר נאכאמאל.", "error");
                return;
            }

            const notification = await notifyOwnerOnSignup(newUser);

            try {
                await fetch(SIGNUP_NOTIFY_ENDPOINT.replace("/notify-signup", "/welcome-email"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: newUser.email,
                        firstname: newUser.firstname,
                        lastname: newUser.lastname
                    })
                });
            } catch (err) {
                console.warn("Welcome email failed:", err);
            }

            showMessage(createMessage, "חשבון געשאַפֿן. דו קענסט יעצט לאָג אַריין.", "success");
            if (!notification.sent && notification.reason !== "missing-endpoint") {
                console.warn("Signup created, but owner notification failed:", notification.reason);
            }

            firstnameInput.value = "";
            lastnameInput.value = "";
            nicknameInput.value = "";
            emailInput.value = "";
            passwordInput.value = "";
            confirmInput.value = "";

            setTimeout(() => {
                const modalElement = document.getElementById("createAccountModal");
                if (window.bootstrap && modalElement) {
                    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
                    modal.hide();
                }
                showMessage(createMessage, "", null);
            }, 700);
        });
    }

    function wireLoginForm() {
        const loginForm = document.getElementById("login-form");
        if (!loginForm) {
            return;
        }

        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const loginMessage = document.getElementById("login-message");
            const nameInput = document.getElementById("login-name");
            const passwordInput = document.getElementById("login-password");

            if (!nameInput || !passwordInput) {
                return;
            }

            const loginIdentifier = nameInput.value.trim();
            const userKey = normalizeName(loginIdentifier);
            try {
                const incomingHash = await hashPassword(passwordInput.value);
                const loginResult = await window.vosHeistApi.login({
                    identifier: loginIdentifier,
                    name: loginIdentifier,
                    passwordHash: incomingHash
                });

                const user = loginResult.user;
                const backendUserKey = loginResult.userKey || userKey;
                sessionStorage.setItem(SESSION_KEY, backendUserKey);
                showMessage(loginMessage, `${user.displayName}, ברוך הבא!`, "success");
            } catch {
                showMessage(loginMessage, "איך טרעף נישט קיין חשבון אדער דער קאוד איז נישט ריכטיג.", "error");
                return;
            }
            setTimeout(() => {
                window.location.href = "account.html";
            }, 400);
        });
    }

    wireCreateAccountForm();
    wireLoginForm();
})();
