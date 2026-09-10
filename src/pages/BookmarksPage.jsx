import { useEffect, useMemo, useState } from "react";
import recipeService from "../services/recipeService";
import RecipeCardComponent from "../components/RecipeCard/RecipeCardComponent";
import PaginatorComponent from "../components/Paginator/PaginatorComponent";
import SearchComponent from "../components/SearchBaR/SearchComponent";
import "../styles/homePage.css";

export default function BookmarksPage() {
    const [recipes, setRecipes] = useState([]);
    const [bookmarkIds, setBookmarkIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const itemsPerPage = 16;
    const bookmarkIdSet = useMemo(() => new Set(bookmarkIds), [bookmarkIds]);

    useEffect(() => {
        recipeService.getBookmarkedRecipes()
            .then((data) => {
                setRecipes(data);
                setBookmarkIds(data.map((recipe) => recipe._id));
            })
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    const filterToBookmarks = (results) => results.filter((recipe) => bookmarkIdSet.has(recipe._id));
    const start = currentPage * itemsPerPage;
    const currentRecipes = recipes.slice(start, start + itemsPerPage);
    const totalPages = Math.ceil(recipes.length / itemsPerPage);

    return (
        <div className="home-container">
            <h1 className="home-title">Bookmarked Recipes</h1>

            <SearchComponent
                setRecipes={setRecipes}
                setCurrentPage={setCurrentPage}
                transformResults={filterToBookmarks}
            />

            {error && <div className="home-message error-message">{error}</div>}
            {loading && <div className="home-message">Loading bookmarks...</div>}
            {!loading && !error && currentRecipes.length === 0 && <div className="home-message">No bookmarked recipes found.</div>}

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
