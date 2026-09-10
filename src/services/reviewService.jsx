import authService from "./authService";

const API_URL = `${import.meta.env.VITE_API_URL}/reviews`;

function getAuthHeader() {
    const token = authService.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response, fallbackMessage) {
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || data?.message || fallbackMessage);
    return data;
}

export async function getReviews(recipeId) {
    const response = await fetch(`${API_URL}/${recipeId}`);
    return handleResponse(response, "Unable to fetch reviews");
}

export async function createReview(recipeId, rating, comment) {
    const response = await fetch(`${API_URL}/${recipeId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader()
        },
        body: JSON.stringify({ rating, comment })
    });
    return handleResponse(response, "Unable to create review");
}

export async function editReview(reviewId, rating, comment) {
    const response = await fetch(`${API_URL}/${reviewId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader()
        },
        body: JSON.stringify({ rating, comment })
    });
    return handleResponse(response, "Unable to update review");
}

export async function deleteReview(reviewId) {
    const response = await fetch(`${API_URL}/${reviewId}`, {
        method: "DELETE",
        headers: getAuthHeader()
    });
    return handleResponse(response, "Unable to delete review");
}

export default { getReviews, createReview, editReview, deleteReview };
