import { useEffect, useState } from "react";
import reviewService from "../../services/reviewService";
import "./review.css";

const getUserId = (user) => String(user?._id || user?.id || "");

export default function ReviewsSection({ recipeId, user }) {
    const [reviews, setReviews] = useState([]);
    const [currentUserReview, setCurrentUserReview] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchReviews() {
            try {
                const data = await reviewService.getReviews(recipeId);
                setReviews(data);

                if (user) {
                    const userReview = data.find((review) => getUserId(review.user) === getUserId(user));
                    setCurrentUserReview(userReview || null);
                    setReviewText(userReview?.comment || "");
                    setReviewRating(userReview?.rating || 5);
                } else {
                    setCurrentUserReview(null);
                    setReviewText("");
                    setReviewRating(5);
                }
            } catch (requestError) {
                setError(requestError.message);
            }
        }

        fetchReviews();
    }, [recipeId, user]);

    async function handleAddOrEditReview(event) {
        event.preventDefault();
        if (!reviewText.trim()) return;

        try {
            setError("");
            if (currentUserReview) {
                const updated = await reviewService.editReview(currentUserReview._id, reviewRating, reviewText);
                setReviews((previous) => previous.map((review) => review._id === updated._id ? updated : review));
                setCurrentUserReview(updated);
            } else {
                const created = await reviewService.createReview(recipeId, reviewRating, reviewText);
                setReviews((previous) => [created, ...previous]);
                setCurrentUserReview(created);
            }
            setIsEditing(false);
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    async function handleDeleteReview() {
        if (!currentUserReview) return;

        try {
            setError("");
            await reviewService.deleteReview(currentUserReview._id);
            setReviews((previous) => previous.filter((review) => review._id !== currentUserReview._id));
            setCurrentUserReview(null);
            setReviewText("");
            setReviewRating(5);
            setIsEditing(false);
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    return (
        <div className="reviews-section">
            <h2>Reviews</h2>
            {error && <div className="inline-error">{error}</div>}

            {user ? (
                currentUserReview ? (
                    !isEditing ? (
                        <div className="review-item">
                            <div className="review-header">
                                <span className="review-author">{user.username}</span>
                                <span className="review-rating">{"★".repeat(currentUserReview.rating)}</span>
                            </div>
                            <p className="review-comment">{currentUserReview.comment}</p>
                            <div className="review-actions">
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                                <button className="delete-btn" onClick={handleDeleteReview}>Delete</button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleAddOrEditReview} className="review-form">
                            <div className="rating-input">
                                <label>Rating:</label>
                                <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}>
                                    {[1, 2, 3, 4, 5].map((rating) => <option key={rating}>{rating}</option>)}
                                </select>
                            </div>
                            <textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} />
                            <button type="submit">Save Review</button>
                            <button type="button" onClick={() => { setIsEditing(false); setReviewText(currentUserReview.comment); setReviewRating(currentUserReview.rating); }}>Cancel</button>
                        </form>
                    )
                ) : (
                    <form onSubmit={handleAddOrEditReview} className="review-form">
                        <div className="rating-input">
                            <label>Rating:</label>
                            <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}>
                                {[1, 2, 3, 4, 5].map((rating) => <option key={rating}>{rating}</option>)}
                            </select>
                        </div>
                        <textarea placeholder="Write your review..." value={reviewText} onChange={(event) => setReviewText(event.target.value)} />
                        <button type="submit">Post Review</button>
                    </form>
                )
            ) : (
                <div className="login-prompt">Log in to post a review.</div>
            )}

            <div className="reviews-list">
                {reviews
                    .filter((review) => getUserId(review.user) !== getUserId(user))
                    .map((review) => (
                        <div key={review._id} className="review-item">
                            <div className="review-header">
                                <span className="review-author">{review.user?.username || "Unknown"}</span>
                                <span className="review-rating">{"★".repeat(review.rating)}</span>
                            </div>
                            <p className="review-comment">{review.comment}</p>
                        </div>
                    ))}
            </div>
        </div>
    );
}
