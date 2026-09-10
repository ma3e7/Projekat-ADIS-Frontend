import { useNavigate } from "react-router-dom";
import "./recipeCard.css";

export default function RecipeCard({ recipe }) {
    const navigate = useNavigate();

    return (
        <article className="recipe-card" onClick={() => navigate(`/recipe/${recipe._id}`)}>
            <div
                className="recipe-image"
                style={{ backgroundImage: recipe.image ? `url(${recipe.image})` : "none" }}
            >
                <div className="rating-time">
                    <span>★ {recipe.rating || 0}</span>
                    <span>{recipe.cookingTime ? `${recipe.cookingTime} min` : "Time n/a"}</span>
                </div>

                <h3 className="recipe-name">{recipe.name}</h3>
            </div>

            <div className="ingredients-overlay">
                <h4>Ingredients</h4>
                <div className="ingredients-list">
                    {(recipe.ingredients || []).map((ingredient) => (
                        <span key={ingredient._id}>{ingredient.name}</span>
                    ))}
                </div>
            </div>
        </article>
    );
}
