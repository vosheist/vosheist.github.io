(() => {
    const API_BASE_URL = "http://localhost:3000";

    async function request(path, options = {}) {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        });

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
        getAdminOverview: (adminKey) => request("/api/admin/overview", {
            headers: {
                "x-admin-key": String(adminKey || "")
            }
        })
    };
})();
