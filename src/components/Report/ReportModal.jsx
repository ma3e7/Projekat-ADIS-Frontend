import { useState } from "react";
import reportService from "../../services/reportService";
import "./report.css";

const reasons = [
    "Inappropriate content",
    "Misleading content",
    "Low quality content",
    "Other"
];

export default function ReportModal({ recipeId, reviewId, targetLabel, onClose, onSubmitted }) {
    const [reason, setReason] = useState(reasons[0]);
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (saving) return;

        try {
            setSaving(true);
            setError("");
            await reportService.createReport({ recipeId, reviewId, reason, description });
            onSubmitted?.();
            onClose();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="report-modal-backdrop" onMouseDown={onClose}>
            <div className="report-modal" onMouseDown={(event) => event.stopPropagation()}>
                <div className="report-modal-heading">
                    <div>
                        <span className="report-eyebrow">Content report</span>
                        <h2>Report {targetLabel}</h2>
                    </div>
                    <button type="button" className="report-close" onClick={onClose}>×</button>
                </div>

                {error && <div className="inline-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label>
                        <span>Reason</span>
                        <select value={reason} onChange={(event) => setReason(event.target.value)}>
                            {reasons.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </label>

                    <label>
                        <span>Additional details</span>
                        <textarea
                            rows="4"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Describe why this content should be reviewed"
                        />
                    </label>

                    <div className="report-modal-actions">
                        <button type="button" className="report-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="report-primary" disabled={saving}>
                            {saving ? "Submitting..." : "Submit Report"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
