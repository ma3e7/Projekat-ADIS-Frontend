import authService from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeader() {
    const token = authService.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response, fallbackMessage) {
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || data?.message || fallbackMessage);
    return data;
}

export async function getNotes(recipeId) {
    const response = await fetch(`${API_URL}/note/${recipeId}`, {
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader()
        }
    });
    return handleResponse(response, "Failed to fetch notes");
}

export async function createNote(recipeId, text) {
    const response = await fetch(`${API_URL}/note/${recipeId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader()
        },
        body: JSON.stringify({ text })
    });
    return handleResponse(response, "Failed to create note");
}

export async function editNote(noteId, text) {
    const response = await fetch(`${API_URL}/note/${noteId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader()
        },
        body: JSON.stringify({ text })
    });
    return handleResponse(response, "Failed to edit note");
}

export async function deleteNote(noteId) {
    const response = await fetch(`${API_URL}/note/${noteId}`, {
        method: "DELETE",
        headers: getAuthHeader()
    });
    return handleResponse(response, "Failed to delete note");
}

export default { getNotes, createNote, editNote, deleteNote };
