import { useEffect, useState } from "react";
import ReportModal from "../Report/ReportModal";
import reviewService from "../../services/reviewService";
import "./review.css";

const getUserId = (user) => String(user?._id || user?.id || "");

export default function ReviewsSection({ recipeId, user }) {
    const [reviews, setReviews] = useState([]);
    const [currentUserReview, setCurrentUserReview] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [isEditing, setIsEditing] = useState(false);
    const [reportReview, setReportReview] = useState(null);
    const [message, setMessage] = useState("");
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
            setMessage("");
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

    async function handleDeleteReview(reviewId, ownReview = false) {
        try {
            setError("");
            setMessage("");
            await reviewService.deleteReview(reviewId);
            setReviews((previous) => previous.filter((review) => review._id !== reviewId));

            if (ownReview) {
                setCurrentUserReview(null);
                setReviewText("");
                setReviewRating(5);
                setIsEditing(false);
            }

            setMessage("Review deleted successfully.");
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    async function handleHelpful(reviewId) {
        try {
            setError("");
            setMessage("");
            const result = await reviewService.toggleHelpfulVote(reviewId);
            setReviews((previous) => previous.map((review) => review._id === reviewId ? {
                ...review,
                helpfulCount: result.helpfulCount,
                helpfulByCurrentUser: result.helpful,
                user: result.authorReputation ? { ...review.user, ...result.authorReputation } : review.user
            } : review));
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    const renderCommunityActions = (review) => {
        const ownReview = getUserId(review.user) === getUserId(user);
        if (!user || ownReview) return null;

        return (
            <div className="review-community-actions">
                <button
                    type="button"
                    className={`helpful-btn ${review.helpfulByCurrentUser ? "active" : ""}`}
                    onClick={() => handleHelpful(review._id)}
                >
                    {review.helpfulByCurrentUser ? "Helpful ✓" : "Helpful"} <span>{review.helpfulCount || 0}</span>
                </button>
                <button type="button" className="report-review-btn" onClick={() => setReportReview(review)}>Report</button>
                {user.role === "admin" && (
                    <button type="button" className="delete-btn" onClick={() => handleDeleteReview(review._id)}>Delete</button>
                )}
            </div>
        );
    };

    return (
        <div className="reviews-section">
            <h2>Reviews</h2>
            {error && <div className="inline-error">{error}</div>}
            {message && <div className="inline-success">{message}</div>}

            {user ? (
                currentUserReview ? (
                    !isEditing ? (
                        <div className="review-item own-review">
                            <div className="review-header">
                                <div>
                                    <span className="review-author">{user.username}</span>
                                    <span className="review-reputation">Your review</span>
                                </div>
                                <span className="review-rating">{"★".repeat(currentUserReview.rating)}</span>
                            </div>
                            <p className="review-comment">{currentUserReview.comment}</p>
                            <div className="review-meta-row">
                                <span>{currentUserReview.helpfulCount || 0} helpful votes</span>
                            </div>
                            <div className="review-actions">
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                                <button className="delete-btn" onClick={() => handleDeleteReview(currentUserReview._id, true)}>Delete</button>
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
                <div className="login-prompt">Log in to post a review and mark helpful contributions.</div>
            )}

            <div className="reviews-list">
                {reviews
                    .filter((review) => getUserId(review.user) !== getUserId(user))
                    .map((review) => (
                        <div key={review._id} className="review-item">
                            <div className="review-header">
                                <div>
                                    <span className="review-author">{review.user?.username || "Unknown"}</span>
                                    {review.user?.reputationLevel && <span className="review-reputation">{review.user.reputationLevel}</span>}
                                </div>
                                <span className="review-rating">{"★".repeat(review.rating)}</span>
                            </div>
                            <p className="review-comment">{review.comment}</p>
                            {renderCommunityActions(review)}
                        </div>
                    ))}
            </div>

            {reportReview && (
                <ReportModal
                    reviewId={reportReview._id}
                    targetLabel="review"
                    onClose={() => setReportReview(null)}
                    onSubmitted={() => setMessage("Report submitted for moderator review.")}
                />
            )}
        </div>
    );
}
