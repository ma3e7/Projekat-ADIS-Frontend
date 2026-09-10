const API_URL = import.meta.env.VITE_API_URL;

function parseTokenPayload(token) {
    try {
        const payload = token.split(".")[1];
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
}

function hasExpired(token) {
    const payload = parseTokenPayload(token);
    return !payload?.exp || payload.exp * 1000 <= Date.now();
}

export async function register(username, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || "Registration failed");
    return data;
}

export async function login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || "Login failed");

    localStorage.setItem("authToken", data.token);
    localStorage.setItem("authUser", JSON.stringify(data.user));
    return data;
}

export function getAuthToken() {
    const token = localStorage.getItem("authToken");
    if (!token || hasExpired(token)) {
        logout();
        return null;
    }
    return token;
}

export function getCurrentUser() {
    const token = getAuthToken();
    const user = localStorage.getItem("authUser");
    if (!token || !user) return null;

    try {
        return JSON.parse(user);
    } catch {
        logout();
        return null;
    }
}

export function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
}

export default {
    register,
    login,
    getAuthToken,
    getCurrentUser,
    logout
};
