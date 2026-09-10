import { useEffect, useState } from "react";
import { getAllRecipes } from "../services/recipeService";
import RecipeCardComponent from "../components/RecipeCard/RecipeCardComponent";
import PaginatorComponent from "../components/Paginator/PaginatorComponent";
import SearchComponent from "../components/SearchBaR/SearchComponent";
import "../styles/homePage.css";

export default function HomePage() {
    const [recipes, setRecipes] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const itemsPerPage = 16;

    useEffect(() => {
        getAllRecipes()
            .then(setRecipes)
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    const start = currentPage * itemsPerPage;
    const currentRecipes = recipes.slice(start, start + itemsPerPage);
    const totalPages = Math.ceil(recipes.length / itemsPerPage);

    return (
        <div className="home-container">
            <h1 className="home-title">Recipes</h1>

            <SearchComponent setRecipes={setRecipes} setCurrentPage={setCurrentPage} />

            {error && <div className="home-message error-message">{error}</div>}
            {loading && <div className="home-message">Loading recipes...</div>}
            {!loading && !error && currentRecipes.length === 0 && <div className="home-message">No recipes found.</div>}

            <div className="recipe-grid">
                {currentRecipes.map((recipe) => (
                    <RecipeCardComponent key={recipe._id} recipe={recipe} />
                ))}
            </div>

            <PaginatorComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
