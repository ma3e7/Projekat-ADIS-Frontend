import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import RecipeFormComponent from "../components/RecipeForm/RecipeFormComponent";
import recipeService from "../services/recipeService";
import "../styles/recipeEditorPage.css";

export default function EditRecipePage() {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [serverErrors, setServerErrors] = useState(null);
    const [message, setMessage] = useState(location.state?.message || "");

    useEffect(() => {
        async function loadRecipe() {
            try {
                const data = await recipeService.getMyRecipeById(recipeId);
                setRecipe(data);
            } catch (error) {
                setMessage(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadRecipe();
    }, [recipeId]);

    const handleSaveDraft = async (data) => {
        try {
            setSaving(true);
            setServerErrors(null);
            setMessage("");
            const updated = await recipeService.updateDraft(recipeId, data);
            setRecipe(updated);
            setMessage("Draft saved successfully.");
        } catch (error) {
            setServerErrors(error.validationErrors);
            setMessage(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitReview = async (data) => {
        try {
            setSubmitting(true);
            setServerErrors(null);
            setMessage("");
            await recipeService.submitExistingRecipe(recipeId, data);
            navigate("/my-recipes", { replace: true, state: { message: "Recipe submitted for review." } });
        } catch (error) {
            setServerErrors(error.validationErrors);
            setMessage(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="page-loading">Loading recipe...</div>;
    if (!recipe) {
        return (
            <div className="recipe-editor-page">
                <div className="page-message error-message">{message || "Recipe not found."}</div>
                <Link to="/my-recipes" className="inline-link">Back to My Recipes</Link>
            </div>
        );
    }

    const editable = ["Draft", "Changes Required"].includes(recipe.status);

    return (
        <div className="recipe-editor-page">
            <div className="recipe-editor-header">
                <div>
                    <span className={`recipe-status-badge status-${recipe.status.toLowerCase().replaceAll(" ", "-")}`}>{recipe.status}</span>
                    <h1>Edit Recipe</h1>
                    <p>Update the recipe and submit it when all required information is complete.</p>
                </div>
                <Link to="/my-recipes" className="inline-link">Back to My Recipes</Link>
            </div>

            {message && <div className={`page-message ${message.includes("successfully") ? "success-message" : "error-message"}`}>{message}</div>}

            {editable ? (
                <RecipeFormComponent
                    initialRecipe={recipe}
                    feedback={recipe.moderationFeedback}
                    onSaveDraft={handleSaveDraft}
                    onSubmitReview={handleSubmitReview}
                    saving={saving}
                    submitting={submitting}
                    serverErrors={serverErrors}
                />
            ) : (
                <div className="page-message neutral-message">This recipe cannot be edited while its status is {recipe.status}.</div>
            )}
        </div>
    );
}
