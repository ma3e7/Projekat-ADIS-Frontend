import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RecipeFormComponent from "../components/RecipeForm/RecipeFormComponent";
import recipeService from "../services/recipeService";
import "../styles/recipeEditorPage.css";

export default function CreateRecipePage() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [serverErrors, setServerErrors] = useState(null);
    const [message, setMessage] = useState("");

    const handleSaveDraft = async (data) => {
        try {
            setSaving(true);
            setServerErrors(null);
            setMessage("");
            const recipe = await recipeService.createDraft(data);
            navigate(`/recipes/${recipe._id}/edit`, { replace: true, state: { message: "Draft saved successfully." } });
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
            await recipeService.submitNewRecipe(data);
            navigate("/my-recipes", { replace: true, state: { message: "Recipe submitted for review." } });
        } catch (error) {
            setServerErrors(error.validationErrors);
            setMessage(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="recipe-editor-page">
            <div className="recipe-editor-header">
                <div>
                    <span className="recipe-status-badge status-draft">Draft</span>
                    <h1>Create Recipe</h1>
                    <p>Add your recipe details, save your progress, or submit the finished recipe for review.</p>
                </div>
            </div>

            {message && <div className="page-message error-message">{message}</div>}

            <RecipeFormComponent
                onSaveDraft={handleSaveDraft}
                onSubmitReview={handleSubmitReview}
                saving={saving}
                submitting={submitting}
                serverErrors={serverErrors}
            />
        </div>
    );
}
