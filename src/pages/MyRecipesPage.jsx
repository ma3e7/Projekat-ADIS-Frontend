import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import recipeService from "../services/recipeService";
import "../styles/myRecipesPage.css";

const statusClass = (status) => `status-${status.toLowerCase().replaceAll(" ", "-")}`;

export default function MyRecipesPage() {
    const location = useLocation();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        recipeService.getMyRecipes()
            .then(setRecipes)
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="my-recipes-page">
            <div className="my-recipes-header">
                <div>
                    <h1>My Recipes</h1>
                    <p>Track drafts, submitted recipes, requested changes, and published contributions.</p>
                </div>
                <Link to="/recipes/new" className="primary-page-action">Create Recipe</Link>
            </div>

            {location.state?.message && <div className="page-message success-message">{location.state.message}</div>}
            {error && <div className="page-message error-message">{error}</div>}

            {loading ? (
                <div className="page-loading">Loading your recipes...</div>
            ) : recipes.length === 0 ? (
                <div className="empty-state">
                    <h2>No recipes yet</h2>
                    <p>Create your first recipe and save it as a draft or submit it for review.</p>
                    <Link to="/recipes/new" className="primary-page-action">Create Recipe</Link>
                </div>
            ) : (
                <div className="my-recipes-list">
                    {recipes.map((recipe) => {
                        const editable = ["Draft", "Changes Required"].includes(recipe.status);
                        return (
                            <article className="my-recipe-card" key={recipe._id}>
                                <div className="my-recipe-main">
                                    <div className="my-recipe-title-row">
                                        <h2>{recipe.name || "Untitled Recipe"}</h2>
                                        <span className={`recipe-status-badge ${statusClass(recipe.status)}`}>{recipe.status}</span>
                                    </div>
                                    <p>{recipe.description || "No description added yet."}</p>
                                    <div className="my-recipe-meta">
                                        <span>{recipe.cookingTime ? `${recipe.cookingTime} min` : "Time not set"}</span>
                                        <span>{recipe.complexity ? `Complexity ${recipe.complexity}/5` : "Complexity not set"}</span>
                                        <span>{recipe.ingredients?.length || 0} ingredients</span>
                                    </div>
                                    {recipe.status === "Changes Required" && recipe.moderationFeedback && (
                                        <div className="my-recipe-feedback">
                                            <strong>Requested changes</strong>
                                            <p>{recipe.moderationFeedback}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="my-recipe-actions">
                                    {editable && <Link to={`/recipes/${recipe._id}/edit`} className="secondary-page-action">Edit</Link>}
                                    {recipe.status === "Published" && <Link to={`/recipe/${recipe._id}`} className="secondary-page-action">View</Link>}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
