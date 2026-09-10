import authService from "./authService";

const API_URL = `${import.meta.env.VITE_API_URL}/reports`;

function headers(includeContentType = false) {
    const token = authService.getAuthToken();
    return {
        ...(includeContentType ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

async function handleResponse(response, fallbackMessage) {
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || data?.error || fallbackMessage);
    return data;
}

export async function createReport(payload) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: headers(true),
        body: JSON.stringify(payload)
    });
    return handleResponse(response, "Unable to submit report");
}

export async function getMyReports() {
    const response = await fetch(`${API_URL}/mine`, { headers: headers() });
    return handleResponse(response, "Unable to fetch reports");
}

export async function getAdminReports(status = "") {
    const suffix = status ? `?status=${encodeURIComponent(status)}` : "";
    const response = await fetch(`${API_URL}/admin${suffix}`, { headers: headers() });
    return handleResponse(response, "Unable to fetch reports");
}

export async function updateReport(reportId, action, resolution = "") {
    const response = await fetch(`${API_URL}/admin/${reportId}`, {
        method: "PUT",
        headers: headers(true),
        body: JSON.stringify({ action, resolution })
    });
    return handleResponse(response, "Unable to update report");
}

export default { createReport, getMyReports, getAdminReports, updateReport };
