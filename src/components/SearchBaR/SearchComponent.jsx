import { useState } from "react";
import "./search.css";
import recipeService from "../../services/recipeService";
import ingredientService from "../../services/ingredientService";

export default function SearchComponent({ setRecipes, setCurrentPage, transformResults }) {
    const [searchType, setSearchType] = useState("name");
    const [inputValue, setInputValue] = useState("");
    const [tags, setTags] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    const applyResults = (recipes) => {
        const nextRecipes = transformResults ? transformResults(recipes) : recipes;
        setRecipes(nextRecipes);
        setCurrentPage(0);
    };

    const handleInputChange = async (event) => {
        const value = event.target.value;
        setInputValue(value);

        if (!value.trim()) {
            setSuggestions([]);
            return;
        }

        try {
            const data = searchType === "ingredient"
                ? await ingredientService.getIngredientsByName(value.trim())
                : await recipeService.getRecipesByName(value.trim());

            const names = searchType === "ingredient" ? data.map((item) => item.name) : data.map((item) => item.name);
            const lowerValue = value.toLowerCase();
            const sorted = [...new Set(names)].sort((a, b) => {
                const indexA = a.toLowerCase().indexOf(lowerValue);
                const indexB = b.toLowerCase().indexOf(lowerValue);
                if (indexA !== indexB) return indexA - indexB;
                return a.length - b.length;
            });

            setSuggestions(sorted);
        } catch {
            setSuggestions([]);
        }
    };

    const performSearch = async (searchData = null) => {
        const recipes = searchType === "name"
            ? searchData?.name
                ? await recipeService.getRecipesByName(searchData.name)
                : inputValue.trim()
                    ? await recipeService.getRecipesByName(inputValue.trim())
                    : await recipeService.getAllRecipes()
            : (searchData?.ingredients || tags).length > 0
                ? await recipeService.getRecipesByIngredients(searchData?.ingredients || tags)
                : await recipeService.getAllRecipes();

        applyResults(recipes);
    };

    const addTag = async (tag) => {
        const normalizedTag = tag.trim();
        if (!normalizedTag || tags.includes(normalizedTag)) return;

        const nextTags = [...tags, normalizedTag];
        setTags(nextTags);
        setInputValue("");
        setSuggestions([]);
        await performSearch({ ingredients: nextTags });
    };

    const removeTag = async (tag) => {
        const nextTags = tags.filter((item) => item !== tag);
        setTags(nextTags);
        await performSearch({ ingredients: nextTags });
    };

    const handleKeyDown = async (event) => {
        if (event.key === "Tab" && suggestions.length > 0) {
            event.preventDefault();
            const first = suggestions[0];

            if (searchType === "name") {
                setInputValue(first);
                setSuggestions([]);
                await performSearch({ name: first });
            } else {
                await addTag(first);
            }
        }

        if (searchType === "ingredient" && event.key === "," && inputValue.trim()) {
            event.preventDefault();
            await addTag(inputValue);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (searchType === "ingredient" && inputValue.trim()) {
            await addTag(inputValue);
            return;
        }
        await performSearch();
    };

    const selectSuggestion = async (suggestion) => {
        if (searchType === "ingredient") {
            await addTag(suggestion);
        } else {
            setInputValue(suggestion);
            setSuggestions([]);
            await performSearch({ name: suggestion });
        }
    };

    const toggleSearchType = async () => {
        setSearchType((previous) => previous === "name" ? "ingredient" : "name");
        setInputValue("");
        setTags([]);
        setSuggestions([]);
        applyResults(await recipeService.getAllRecipes());
    };

    return (
        <div className="search-component">
            <div className="search-header">
                <button type="button" className="toggle-btn" onClick={toggleSearchType}>
                    Search by {searchType === "name" ? "Name" : "Ingredient"}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="search-form">
                <input
                    type="text"
                    placeholder={searchType === "name" ? "Search by recipe name..." : "Add ingredient..."}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
                <button type="submit">Search</button>
            </form>

            {suggestions.length > 0 && (
                <div className="suggestions-list">
                    {suggestions.map((suggestion) => (
                        <button
                            type="button"
                            key={suggestion}
                            className="suggestion-item"
                            onClick={() => selectSuggestion(suggestion)}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {searchType === "ingredient" && tags.length > 0 && (
                <div className="tags-container">
                    {tags.map((tag) => (
                        <div key={tag} className="tag">
                            {tag}
                            <button type="button" className="remove-tag" onClick={() => removeTag(tag)}>×</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
