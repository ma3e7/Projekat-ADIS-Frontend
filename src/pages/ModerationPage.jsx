import { useEffect, useMemo, useState } from "react";
import recipeService from "../services/recipeService";
import "../styles/moderationPage.css";

export default function ModerationPage() {
    const [recipes, setRecipes] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadRecipes() {
            try {
                const data = await recipeService.getPendingRecipes();
                setRecipes(data);
                setSelectedId(data[0]?._id || null);
            } catch (error) {
                setMessage(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadRecipes();
    }, []);

    const selectedRecipe = useMemo(
        () => recipes.find((recipe) => recipe._id === selectedId) || null,
        [recipes, selectedId]
    );

    const selectRecipe = (recipeId) => {
        setSelectedId(recipeId);
        setFeedback("");
        setMessage("");
    };

    const handleDecision = async (action) => {
        if (!selectedRecipe || saving) return;
        if ((action === "requestChanges" || action === "reject") && !feedback.trim()) {
            setMessage("Feedback is required when requesting changes or rejecting a recipe.");
            return;
        }

        try {
            setSaving(true);
            setMessage("");
            await recipeService.moderateRecipe(selectedRecipe._id, action, feedback);
            const nextRecipes = recipes.filter((recipe) => recipe._id !== selectedRecipe._id);
            setRecipes(nextRecipes);
            setSelectedId(nextRecipes[0]?._id || null);
            setFeedback("");
            setMessage("Moderation decision saved successfully.");
        } catch (error) {
            setMessage(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="page-loading">Loading moderation queue...</div>;

    return (
        <div className="moderation-page">
            <div className="moderation-header">
                <div>
                    <span className="admin-label">Admin</span>
                    <h1>Recipe Moderation</h1>
                    <p>Review recipes submitted by users and decide whether they are ready for publication.</p>
                </div>
                <div className="pending-counter">
                    <strong>{recipes.length}</strong>
                    <span>Pending</span>
                </div>
            </div>

            {message && <div className={`page-message ${message.includes("successfully") ? "success-message" : "error-message"}`}>{message}</div>}

            {recipes.length === 0 ? (
                <div className="empty-state">
                    <h2>Moderation queue is empty</h2>
                    <p>There are no recipes waiting for review.</p>
                </div>
            ) : (
                <div className="moderation-layout">
                    <aside className="moderation-queue">
                        <h2>Pending Review</h2>
                        {recipes.map((recipe) => (
                            <button
                                type="button"
                                key={recipe._id}
                                className={`moderation-queue-item ${selectedId === recipe._id ? "active" : ""}`}
                                onClick={() => selectRecipe(recipe._id)}
                            >
                                <strong>{recipe.name || "Untitled Recipe"}</strong>
                                <span>{recipe.author?.username || "Unknown author"}</span>
                            </button>
                        ))}
                    </aside>

                    {selectedRecipe && (
                        <section className="moderation-detail">
                            <div className="moderation-recipe-heading">
                                <div>
                                    <span className="recipe-status-badge status-pending-review">Pending Review</span>
                                    <h2>{selectedRecipe.name || "Untitled Recipe"}</h2>
                                    <p>Submitted by {selectedRecipe.author?.username || "Unknown author"}</p>
                                </div>
                                {selectedRecipe.image && <img src={selectedRecipe.image} alt={selectedRecipe.name} />}
                            </div>

                            <div className="moderation-meta">
                                <span><strong>Cooking time</strong>{selectedRecipe.cookingTime ? `${selectedRecipe.cookingTime} min` : "Not set"}</span>
                                <span><strong>Complexity</strong>{selectedRecipe.complexity ? `${selectedRecipe.complexity}/5` : "Not set"}</span>
                            </div>

                            <div className="moderation-content-block">
                                <h3>Description</h3>
                                <p>{selectedRecipe.description || "No description provided."}</p>
                            </div>

                            <div className="moderation-content-block">
                                <h3>Ingredients</h3>
                                <div className="moderation-ingredients">
                                    {(selectedRecipe.ingredientDetails?.length
                                        ? selectedRecipe.ingredientDetails
                                        : selectedRecipe.ingredients || []
                                    ).map((item, index) => {
                                        const ingredient = item.ingredient || item;
                                        const amount = item.quantity || item.unit ? `${item.quantity || ""} ${item.unit || ""}`.trim() : "";
                                        return (
                                            <span key={ingredient?._id || `${ingredient?.name}-${index}`}>
                                                {ingredient?.name || "Ingredient"}{amount ? ` · ${amount}` : ""}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="moderation-content-block">
                                <h3>Preparation</h3>
                                <p>{selectedRecipe.instructions || selectedRecipe.description || "No preparation instructions provided."}</p>
                            </div>

                            <div className="moderation-decision-panel">
                                <label>
                                    <span>Moderator feedback</span>
                                    <textarea
                                        rows="4"
                                        value={feedback}
                                        onChange={(event) => setFeedback(event.target.value)}
                                        placeholder="Required for requested changes and rejection"
                                    />
                                </label>
                                <div className="moderation-actions">
                                    <button type="button" className="approve-action" disabled={saving} onClick={() => handleDecision("approve")}>Approve</button>
                                    <button type="button" className="changes-action" disabled={saving} onClick={() => handleDecision("requestChanges")}>Request Changes</button>
                                    <button type="button" className="reject-action" disabled={saving} onClick={() => handleDecision("reject")}>Reject</button>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
