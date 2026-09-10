import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NoteComponent from "../components/Notes/NoteComponent";
import ReportModal from "../components/Report/ReportModal";
import ReviewComponent from "../components/Reviews/ReviewComponent";
import { getCurrentUser } from "../services/authService";
import recipeService from "../services/recipeService";
import "../styles/recipePage.css";

export default function RecipePage() {
    const { recipeId } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const user = getCurrentUser();

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await recipeService.getRecipeById(recipeId);
                setRecipe(data);
            } catch (requestError) {
                setError(requestError.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [recipeId]);

    const handleBookmark = async () => {
        if (!user || bookmarkLoading) return;

        try {
            setBookmarkLoading(true);
            setError("");
            const updated = await recipeService.toggleBookmark(recipeId);
            setRecipe((previous) => ({ ...previous, bookmarked: updated.recipe.bookmarked }));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setBookmarkLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading recipe...</div>;
    if (!recipe) return <div className="error">{error || "Recipe not found."}</div>;

    const ingredientRows = recipe.ingredientDetails?.length
        ? recipe.ingredientDetails
        : (recipe.ingredients || []).map((ingredient) => ({ ingredient, quantity: "", unit: "" }));
    const isOwnRecipe = user && String(recipe.author?._id || recipe.author) === String(user._id || user.id);

    return (
        <div className="recipe-page">
            <div className="recipe-header">
                <div>
                    <h1>{recipe.name}</h1>
                    {recipe.author?.username && <p className="recipe-author">By {recipe.author.username}</p>}
                </div>
                {user && (
                    <div className="recipe-header-actions">
                        <button
                            className={`bookmark-btn ${recipe.bookmarked ? "bookmarked" : ""}`}
                            onClick={handleBookmark}
                            disabled={bookmarkLoading}
                        >
                            {bookmarkLoading ? "Processing..." : recipe.bookmarked ? "★ Remove Bookmark" : "☆ Bookmark"}
                        </button>
                        {!isOwnRecipe && <button type="button" className="report-recipe-btn" onClick={() => setShowReport(true)}>Report Recipe</button>}
                    </div>
                )}
            </div>

            {error && <div className="inline-error">{error}</div>}
            {message && <div className="recipe-success-message">{message}</div>}

            {recipe.image && <img src={recipe.image} alt={recipe.name} className="recipe-image" />}

            <div className="recipe-info">
                <p><strong>Cooking time:</strong> {recipe.cookingTime || "N/A"} {recipe.cookingTime ? "min" : ""}</p>
                <p><strong>Complexity:</strong> {recipe.complexity || "N/A"}{recipe.complexity ? "/5" : ""}</p>
                <p><strong>Rating:</strong> {recipe.rating || 0}/5</p>
            </div>

            <div className="ingredients-section">
                <h2>Ingredients</h2>
                <ul className="recipe-details-ingredients-list">
                    {ingredientRows.map((item, index) => (
                        <li key={item.ingredient?._id || index} className="ingredient-item">
                            <span>{item.ingredient?.name}</span>
                            {(item.quantity || item.unit) && <strong>{`${item.quantity || ""} ${item.unit || ""}`.trim()}</strong>}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="description-section">
                <h2>Description</h2>
                <p className="description">{recipe.description}</p>
            </div>

            {recipe.instructions && (
                <div className="description-section">
                    <h2>Preparation</h2>
                    <p className="description preparation-text">{recipe.instructions}</p>
                </div>
            )}

            <NoteComponent recipeId={recipeId} user={user} />
            <ReviewComponent recipeId={recipeId} user={user} />

            {showReport && (
                <ReportModal
                    recipeId={recipeId}
                    targetLabel="recipe"
                    onClose={() => setShowReport(false)}
                    onSubmitted={() => setMessage("Report submitted for moderator review.")}
                />
            )}
        </div>
    );
}
