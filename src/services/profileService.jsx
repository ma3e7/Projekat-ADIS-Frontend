import authService from "./authService";

const API_URL = `${import.meta.env.VITE_API_URL}/profile`;

export async function getMyProfile() {
    const token = authService.getAuthToken();
    const response = await fetch(`${API_URL}/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || "Unable to fetch profile");
    return data;
}

export default { getMyProfile };
