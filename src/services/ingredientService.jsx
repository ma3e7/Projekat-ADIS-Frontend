const API_URL = import.meta.env.VITE_API_URL;

export async function getIngredientsByName(name) {
    const response = await fetch(`${API_URL}/ingredients?name=${encodeURIComponent(name)}`);
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || "Error fetching ingredients");
    return data;
}

export default { getIngredientsByName };
