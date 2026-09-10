import authService from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

function authHeaders(includeContentType = false) {
    const token = authService.getAuthToken();
    return {
        ...(includeContentType ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

async function handleResponse(response, fallbackMessage) {
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        const error = new Error(data?.message || data?.error || fallbackMessage);
        error.validationErrors = data?.errors || null;
        error.status = response.status;
        throw error;
    }
    return data;
}

export async function getAllRecipes() {
    const response = await fetch(`${API_URL}/recipes`, { headers: authHeaders() });
    return handleResponse(response, "Error fetching recipes");
}

export async function getRecipeById(recipeId) {
    const response = await fetch(`${API_URL}/recipes/${recipeId}`, { headers: authHeaders() });
    return handleResponse(response, `Recipe with id ${recipeId} not found`);
}

export async function toggleBookmark(recipeId) {
    const response = await fetch(`${API_URL}/recipes/bookmark/${recipeId}`, {
        method: "PUT",
        headers: authHeaders()
    });
    return handleResponse(response, "Error updating bookmark");
}

export async function getRecipesByName(name) {
    const response = await fetch(`${API_URL}/recipes/search?name=${encodeURIComponent(name)}`, {
        headers: authHeaders()
    });
    return handleResponse(response, "Error fetching recipes by name");
}

export async function getBookmarkedRecipes() {
    const response = await fetch(`${API_URL}/recipes/bookmarked`, {
        headers: authHeaders()
    });
    return handleResponse(response, "Error fetching bookmarked recipes");
}

export async function getRecipesByIngredients(ingredients) {
    const query = ingredients.join(",");
    const response = await fetch(`${API_URL}/recipes/by-ingredients?ingredients=${encodeURIComponent(query)}`, {
        headers: authHeaders()
    });
    return handleResponse(response, "Error fetching recipes by ingredients");
}

export async function createDraft(data) {
    const response = await fetch(`${API_URL}/recipes/draft`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(data)
    });
    return handleResponse(response, "Unable to save draft");
}

export async function updateDraft(recipeId, data) {
    const response = await fetch(`${API_URL}/recipes/draft/${recipeId}`, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify(data)
    });
    return handleResponse(response, "Unable to update draft");
}

export async function submitNewRecipe(data) {
    const response = await fetch(`${API_URL}/recipes/submit`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(data)
    });
    return handleResponse(response, "Unable to submit recipe");
}

export async function submitExistingRecipe(recipeId, data) {
    const response = await fetch(`${API_URL}/recipes/submit/${recipeId}`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(data)
    });
    return handleResponse(response, "Unable to submit recipe");
}

export async function getMyRecipes() {
    const response = await fetch(`${API_URL}/recipes/mine`, { headers: authHeaders() });
    return handleResponse(response, "Unable to fetch your recipes");
}

export async function getMyRecipeById(recipeId) {
    const response = await fetch(`${API_URL}/recipes/mine/${recipeId}`, { headers: authHeaders() });
    return handleResponse(response, "Unable to fetch recipe");
}

export async function getPendingRecipes() {
    const response = await fetch(`${API_URL}/recipes/moderation/pending`, { headers: authHeaders() });
    return handleResponse(response, "Unable to fetch pending recipes");
}

export async function getPendingRecipeById(recipeId) {
    const response = await fetch(`${API_URL}/recipes/moderation/${recipeId}`, { headers: authHeaders() });
    return handleResponse(response, "Unable to fetch pending recipe");
}

export async function moderateRecipe(recipeId, action, feedback = "") {
    const response = await fetch(`${API_URL}/recipes/moderation/${recipeId}`, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify({ action, feedback })
    });
    return handleResponse(response, "Unable to save moderation decision");
}

export default {
    getAllRecipes,
    getRecipeById,
    toggleBookmark,
    getRecipesByName,
    getRecipesByIngredients,
    getBookmarkedRecipes,
    createDraft,
    updateDraft,
    submitNewRecipe,
    submitExistingRecipe,
    getMyRecipes,
    getMyRecipeById,
    getPendingRecipes,
    getPendingRecipeById,
    moderateRecipe
};
