(() => {
    function normalizeBaseUrl(url) {
        return String(url || "").trim().replace(/\/+$/, "");
    }

    function resolveApiBaseUrl() {
        const params = new URLSearchParams(window.location.search);
        const queryBaseUrl = normalizeBaseUrl(params.get("apiBaseUrl"));

        if (queryBaseUrl) {
            try {
                localStorage.setItem("vosHeistApiBaseUrl", queryBaseUrl);
            } catch {
                // Ignore storage errors (private mode, blocked storage, etc.)
            }
            return queryBaseUrl;
        }

        const runtimeBaseUrl = normalizeBaseUrl(window.VOS_HEIST_API_BASE_URL);
        if (runtimeBaseUrl) {
            return runtimeBaseUrl;
        }

        let savedBaseUrl = "";
        try {
            savedBaseUrl = normalizeBaseUrl(localStorage.getItem("vosHeistApiBaseUrl"));
        } catch {
            savedBaseUrl = "";
        }

        if (savedBaseUrl) {
            return savedBaseUrl;
        }

        return "http://localhost:3000";
    }

    const API_BASE_URL = resolveApiBaseUrl();

    async function request(path, options = {}) {
        let response;
        try {
            response = await fetch(`${API_BASE_URL}${path}`, {
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },
                ...options
            });
        } catch {
            throw new Error(`Failed to fetch from ${API_BASE_URL}`);
        }

        let payload = null;
        try {
            payload = await response.json();
        } catch {
            payload = null;
        }

        if (!response.ok) {
            const message = payload && payload.error ? payload.error : `Request failed (${response.status})`;
            throw new Error(message);
        }

        return payload;
    }

    window.vosHeistApi = {
        signup: (body) => request("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),
        login: (body) => request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
        getUser: (userKey) => request(`/api/users/${encodeURIComponent(userKey)}`),
        updateProfile: (userKey, body) => request(`/api/users/${encodeURIComponent(userKey)}/profile`, { method: "PUT", body: JSON.stringify(body) }),
        getCommunity: (excludeUserKey) => request(`/api/community?exclude=${encodeURIComponent(excludeUserKey || "")}`),
        getBaisMedrash: () => request("/api/bais-medrash"),
        addBaisMedrash: (post) => request("/api/bais-medrash", { method: "POST", body: JSON.stringify({ post }) }),
        getCoffeeRoom: () => request("/api/coffee-room"),
        addCoffeeRoom: (message) => request("/api/coffee-room", { method: "POST", body: JSON.stringify({ message }) }),
        getGameScores: (gameKey) => request(`/api/games/${encodeURIComponent(gameKey)}/scores`),
        submitGameScore: (gameKey, body) => request(`/api/games/${encodeURIComponent(gameKey)}/scores`, {
            method: "POST",
            body: JSON.stringify(body)
        }),
        getAdminOverview: (adminKey) => request("/api/admin/overview", {
            headers: {
                "x-admin-key": String(adminKey || "")
            }
        }),
        getAdminMemberDetails: (adminKey, userKey) => request(`/api/admin/members/${encodeURIComponent(userKey)}/details`, {
            headers: {
                "x-admin-key": String(adminKey || "")
            }
        }),
        setAdminMemberRevoked: (adminKey, userKey, body) => request(`/api/admin/members/${encodeURIComponent(userKey)}/revoke`, {
            method: "POST",
            headers: {
                "x-admin-key": String(adminKey || "")
            },
            body: JSON.stringify(body || {})
        })
    };
})();
