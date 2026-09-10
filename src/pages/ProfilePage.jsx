import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import profileService from "../services/profileService";
import "../styles/profilePage.css";

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProfile() {
            try {
                setProfile(await profileService.getMyProfile());
            } catch (requestError) {
                setError(requestError.message);
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    if (loading) return <div className="page-loading">Loading profile...</div>;
    if (!profile) return <div className="page-loading">{error || "Profile could not be loaded."}</div>;

    return (
        <div className="profile-page">
            <section className="profile-hero">
                <div>
                    <span className="profile-eyebrow">Community profile</span>
                    <h1>{profile.user.username}</h1>
                    <p>{profile.user.role === "admin" ? "Administrator" : "Registered user"}</p>
                </div>
                <div className="reputation-card">
                    <span>Reputation</span>
                    <strong>{profile.user.reputationScore}</strong>
                    <small>{profile.user.reputationLevel}</small>
                </div>
            </section>

            <section className="profile-stats">
                <div><strong>{profile.stats.favorites}</strong><span>Favorites</span></div>
                <div><strong>{profile.stats.recipes}</strong><span>Recipes</span></div>
                <div><strong>{profile.stats.reviews}</strong><span>Reviews</span></div>
                <div><strong>{profile.stats.notes}</strong><span>Notes</span></div>
            </section>

            <div className="profile-grid">
                <section className="profile-panel">
                    <div className="profile-panel-heading">
                        <h2>My Recipes</h2>
                        <Link to="/my-recipes">Open all</Link>
                    </div>
                    {profile.recipes.length === 0 ? (
                        <p className="profile-empty">You have not created any recipes yet.</p>
                    ) : profile.recipes.slice(0, 5).map((recipe) => (
                        <Link className="profile-list-item" to="/my-recipes" key={recipe._id}>
                            <span>{recipe.name || "Untitled Recipe"}</span>
                            <small>{recipe.status}</small>
                        </Link>
                    ))}
                </section>

                <section className="profile-panel">
                    <div className="profile-panel-heading">
                        <h2>Favorites</h2>
                        <Link to="/bookmarks">Open all</Link>
                    </div>
                    {profile.favorites.length === 0 ? (
                        <p className="profile-empty">No favorite recipes yet.</p>
                    ) : profile.favorites.slice(0, 5).map((recipe) => (
                        <Link className="profile-list-item" to={`/recipe/${recipe._id}`} key={recipe._id}>
                            <span>{recipe.name}</span>
                            <small>{recipe.cookingTime ? `${recipe.cookingTime} min` : "Recipe"}</small>
                        </Link>
                    ))}
                </section>

                <section className="profile-panel">
                    <div className="profile-panel-heading">
                        <h2>My Reviews</h2>
                    </div>
                    {profile.reviews.length === 0 ? (
                        <p className="profile-empty">You have not posted any reviews yet.</p>
                    ) : profile.reviews.slice(0, 5).map((review) => (
                        <div className="profile-content-item" key={review._id}>
                            {review.recipe?._id ? <Link to={`/recipe/${review.recipe._id}`}>{review.recipe.name}</Link> : <strong>Unavailable recipe</strong>}
                            <span>{"★".repeat(review.rating)} {review.comment}</span>
                        </div>
                    ))}
                </section>

                <section className="profile-panel">
                    <div className="profile-panel-heading">
                        <h2>Private Notes</h2>
                    </div>
                    {profile.notes.length === 0 ? (
                        <p className="profile-empty">You have not saved any private notes yet.</p>
                    ) : profile.notes.slice(0, 5).map((note) => (
                        <div className="profile-content-item" key={note._id}>
                            {note.recipe?._id ? <Link to={`/recipe/${note.recipe._id}`}>{note.recipe.name}</Link> : <strong>Unavailable recipe</strong>}
                            <span>{note.text}</span>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}
