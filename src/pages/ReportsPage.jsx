import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import reportService from "../services/reportService";
import "../styles/reportsPage.css";

const statusOptions = ["All", "Open", "Under Review", "Resolved", "Dismissed"];

export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [status, setStatus] = useState("All");
    const [resolution, setResolution] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadReports() {
            try {
                setLoading(true);
                setReports(await reportService.getAdminReports(status === "All" ? "" : status));
            } catch (error) {
                setMessage(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadReports();
    }, [status]);

    const activeCount = useMemo(
        () => reports.filter((report) => report.status === "Open" || report.status === "Under Review").length,
        [reports]
    );

    const handleAction = async (report, action) => {
        const text = resolution[report._id] || "";
        if ((action === "resolve" || action === "dismiss") && !text.trim()) {
            setMessage("Resolution is required before closing a report.");
            return;
        }

        try {
            const updated = await reportService.updateReport(report._id, action, text);
            setReports((previous) => previous.map((item) => item._id === updated._id ? updated : item));
            setMessage("Report status updated successfully.");
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="reports-page">
            <div className="reports-header">
                <div>
                    <span className="admin-label">Admin</span>
                    <h1>Content Reports</h1>
                    <p>Review reports submitted by registered users and record the moderation outcome.</p>
                </div>
                <div className="pending-counter">
                    <strong>{activeCount}</strong>
                    <span>Active</span>
                </div>
            </div>

            <div className="reports-toolbar">
                <label>
                    <span>Status</span>
                    <select value={status} onChange={(event) => setStatus(event.target.value)}>
                        {statusOptions.map((option) => <option key={option}>{option}</option>)}
                    </select>
                </label>
            </div>

            {message && <div className={`page-message ${message.includes("successfully") ? "success-message" : "error-message"}`}>{message}</div>}

            {loading ? (
                <div className="page-loading">Loading reports...</div>
            ) : reports.length === 0 ? (
                <div className="empty-state"><h2>No reports found</h2><p>There are no reports in the selected status.</p></div>
            ) : (
                <div className="reports-list">
                    {reports.map((report) => {
                        const recipe = report.recipe || report.review?.recipe;
                        const isClosed = report.status === "Resolved" || report.status === "Dismissed";
                        return (
                            <article className="report-card" key={report._id}>
                                <div className="report-card-heading">
                                    <div>
                                        <span className={`report-status status-${report.status.toLowerCase().replace(" ", "-")}`}>{report.status}</span>
                                        <h2>{report.review ? "Review report" : "Recipe report"}</h2>
                                        <p>Reported by {report.reporter?.username || "Unknown user"}</p>
                                    </div>
                                    <span className="report-date">{new Date(report.createdAt).toLocaleDateString()}</span>
                                </div>

                                <div className="report-target">
                                    {recipe?._id ? <Link to={`/recipe/${recipe._id}`}>{recipe.name || "Open recipe"}</Link> : <strong>Content unavailable</strong>}
                                    {report.review && <p>“{report.review.comment}”</p>}
                                </div>

                                <div className="report-reason">
                                    <strong>{report.reason}</strong>
                                    {report.description && <p>{report.description}</p>}
                                </div>

                                {isClosed ? (
                                    <div className="report-resolution">
                                        <strong>Outcome</strong>
                                        <p>{report.resolution}</p>
                                        {report.reviewedBy?.username && <span>Reviewed by {report.reviewedBy.username}</span>}
                                    </div>
                                ) : (
                                    <div className="report-decision">
                                        <textarea
                                            rows="3"
                                            value={resolution[report._id] || ""}
                                            onChange={(event) => setResolution((previous) => ({ ...previous, [report._id]: event.target.value }))}
                                            placeholder="Record the moderation outcome"
                                        />
                                        <div>
                                            {report.status === "Open" && <button type="button" className="review-action" onClick={() => handleAction(report, "startReview")}>Start Review</button>}
                                            <button type="button" className="resolve-action" onClick={() => handleAction(report, "resolve")}>Resolve</button>
                                            <button type="button" className="dismiss-action" onClick={() => handleAction(report, "dismiss")}>Dismiss</button>
                                        </div>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
