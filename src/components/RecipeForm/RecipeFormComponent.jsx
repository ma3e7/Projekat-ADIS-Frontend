import { useState } from "react";
import "./recipeForm.css";

const emptyIngredient = { name: "", quantity: "", unit: "" };

const normalizeIngredientRows = (recipe) => {
    if (recipe?.ingredientDetails?.length) {
        return recipe.ingredientDetails.map((item) => ({
            name: item.ingredient?.name || "",
            quantity: item.quantity || "",
            unit: item.unit || ""
        }));
    }

    if (recipe?.ingredients?.length) {
        return recipe.ingredients.map((item) => ({
            name: item.name || "",
            quantity: "",
            unit: ""
        }));
    }

    return [{ ...emptyIngredient }];
};

const recipeToFormData = (recipe) => ({
    name: recipe?.name || "",
    description: recipe?.description || "",
    instructions: recipe?.instructions || "",
    image: recipe?.image || "",
    cookingTime: recipe?.cookingTime ?? "",
    complexity: recipe?.complexity ?? "",
    ingredients: normalizeIngredientRows(recipe)
});

export default function RecipeFormComponent({
    initialRecipe,
    onSaveDraft,
    onSubmitReview,
    saving,
    submitting,
    serverErrors,
    feedback
}) {
    const [formData, setFormData] = useState(() => recipeToFormData(initialRecipe));
    const [errors, setErrors] = useState({});

    const busy = saving || submitting;
    const hasFeedback = Boolean(feedback?.trim());
    const visibleErrors = { ...(serverErrors || {}), ...errors };

    const updateField = (field, value) => {
        setFormData((previous) => ({ ...previous, [field]: value }));
        setErrors((previous) => ({ ...previous, [field]: undefined }));
    };

    const updateIngredient = (index, field, value) => {
        setFormData((previous) => ({
            ...previous,
            ingredients: previous.ingredients.map((ingredient, ingredientIndex) =>
                ingredientIndex === index ? { ...ingredient, [field]: value } : ingredient
            )
        }));
        setErrors((previous) => ({ ...previous, ingredients: undefined }));
    };

    const addIngredient = () => {
        setFormData((previous) => ({
            ...previous,
            ingredients: [...previous.ingredients, { ...emptyIngredient }]
        }));
    };

    const removeIngredient = (index) => {
        setFormData((previous) => {
            const nextIngredients = previous.ingredients.filter((_, ingredientIndex) => ingredientIndex !== index);
            return {
                ...previous,
                ingredients: nextIngredients.length ? nextIngredients : [{ ...emptyIngredient }]
            };
        });
    };

    const validateForSubmission = () => {
        const nextErrors = {};
        const cookingTime = Number(formData.cookingTime);
        const complexity = Number(formData.complexity);
        const validIngredients = formData.ingredients.filter((ingredient) => ingredient.name.trim());

        if (!formData.name.trim()) nextErrors.name = "Recipe name is required.";
        if (!formData.description.trim()) nextErrors.description = "Recipe description is required.";
        if (!formData.instructions.trim()) nextErrors.instructions = "Preparation instructions are required.";
        if (!cookingTime || cookingTime <= 0) nextErrors.cookingTime = "Cooking time must be greater than zero.";
        if (!complexity || complexity < 1 || complexity > 5) nextErrors.complexity = "Complexity must be between 1 and 5.";
        if (validIngredients.length === 0) nextErrors.ingredients = "At least one ingredient is required.";

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const payload = () => ({
        ...formData,
        cookingTime: formData.cookingTime === "" ? "" : Number(formData.cookingTime),
        complexity: formData.complexity === "" ? "" : Number(formData.complexity),
        ingredients: formData.ingredients
            .map((ingredient) => ({
                name: ingredient.name.trim(),
                quantity: ingredient.quantity.trim(),
                unit: ingredient.unit.trim()
            }))
            .filter((ingredient) => ingredient.name)
    });

    const handleDraft = async () => {
        setErrors({});
        await onSaveDraft(payload());
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForSubmission()) return;
        await onSubmitReview(payload());
    };

    return (
        <form className="recipe-form-page" onSubmit={handleSubmit}>
            {hasFeedback && (
                <div className="moderation-feedback-banner">
                    <strong>Requested changes</strong>
                    <p>{feedback}</p>
                </div>
            )}

            <section className="recipe-form-section">
                <h2>Basic Information</h2>
                <div className="recipe-form-grid">
                    <label className="recipe-form-field recipe-form-field-wide">
                        <span>Recipe name</span>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(event) => updateField("name", event.target.value)}
                            placeholder="e.g. Kačamak"
                        />
                        {visibleErrors.name && <small>{visibleErrors.name}</small>}
                    </label>

                    <label className="recipe-form-field">
                        <span>Cooking time</span>
                        <div className="input-with-suffix">
                            <input
                                type="number"
                                min="1"
                                value={formData.cookingTime}
                                onChange={(event) => updateField("cookingTime", event.target.value)}
                                placeholder="45"
                            />
                            <span>min</span>
                        </div>
                        {visibleErrors.cookingTime && <small>{visibleErrors.cookingTime}</small>}
                    </label>

                    <label className="recipe-form-field">
                        <span>Complexity</span>
                        <select
                            value={formData.complexity}
                            onChange={(event) => updateField("complexity", event.target.value)}
                        >
                            <option value="">Select</option>
                            {[1, 2, 3, 4, 5].map((value) => (
                                <option value={value} key={value}>{value} / 5</option>
                            ))}
                        </select>
                        {visibleErrors.complexity && <small>{visibleErrors.complexity}</small>}
                    </label>

                    <label className="recipe-form-field recipe-form-field-wide">
                        <span>Image URL</span>
                        <input
                            type="url"
                            value={formData.image}
                            onChange={(event) => updateField("image", event.target.value)}
                            placeholder="https://example.com/recipe.jpg"
                        />
                    </label>

                    <label className="recipe-form-field recipe-form-field-wide">
                        <span>Short description</span>
                        <textarea
                            rows="4"
                            value={formData.description}
                            onChange={(event) => updateField("description", event.target.value)}
                            placeholder="Briefly describe the dish"
                        />
                        {visibleErrors.description && <small>{visibleErrors.description}</small>}
                    </label>
                </div>
            </section>

            <section className="recipe-form-section">
                <div className="recipe-form-section-header">
                    <h2>Ingredients</h2>
                    <button type="button" className="secondary-action" onClick={addIngredient}>Add Ingredient</button>
                </div>

                <div className="ingredient-editor-list">
                    {formData.ingredients.map((ingredient, index) => (
                        <div className="ingredient-editor-row" key={index}>
                            <input
                                type="text"
                                value={ingredient.name}
                                onChange={(event) => updateIngredient(index, "name", event.target.value)}
                                placeholder="Ingredient"
                            />
                            <input
                                type="text"
                                value={ingredient.quantity}
                                onChange={(event) => updateIngredient(index, "quantity", event.target.value)}
                                placeholder="Quantity"
                            />
                            <input
                                type="text"
                                value={ingredient.unit}
                                onChange={(event) => updateIngredient(index, "unit", event.target.value)}
                                placeholder="Unit"
                            />
                            <button type="button" className="remove-ingredient" onClick={() => removeIngredient(index)}>Remove</button>
                        </div>
                    ))}
                </div>
                {visibleErrors.ingredients && <div className="recipe-form-error">{visibleErrors.ingredients}</div>}
            </section>

            <section className="recipe-form-section">
                <h2>Preparation</h2>
                <label className="recipe-form-field">
                    <span>Instructions</span>
                    <textarea
                        rows="8"
                        value={formData.instructions}
                        onChange={(event) => updateField("instructions", event.target.value)}
                        placeholder="Describe the preparation steps"
                    />
                    {visibleErrors.instructions && <small>{visibleErrors.instructions}</small>}
                </label>
            </section>

            <div className="recipe-form-actions">
                <button type="button" className="draft-action" onClick={handleDraft} disabled={busy}>
                    {saving ? "Saving..." : "Save as Draft"}
                </button>
                <button type="submit" className="submit-action" disabled={busy}>
                    {submitting ? "Submitting..." : "Submit for Review"}
                </button>
            </div>
        </form>
    );
}
