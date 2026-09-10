import { useEffect, useState } from "react";
import noteService from "../../services/noteService";
import "./note.css";

export default function NotesSection({ recipeId, user }) {
    const [note, setNote] = useState(null);
    const [noteText, setNoteText] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchNote() {
            if (!user) {
                setNote(null);
                setNoteText("");
                return;
            }

            try {
                const notes = await noteService.getNotes(recipeId);
                const userNote = notes[0] || null;
                setNote(userNote);
                setNoteText(userNote?.text || "");
            } catch (requestError) {
                setError(requestError.message);
            }
        }

        fetchNote();
    }, [recipeId, user]);

    async function handleAddOrEditNote(event) {
        event.preventDefault();
        if (!noteText.trim()) return;

        try {
            setError("");
            if (note) {
                const updated = await noteService.editNote(note._id, noteText);
                setNote(updated);
            } else {
                const created = await noteService.createNote(recipeId, noteText);
                setNote(created);
            }
            setIsEditing(false);
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    async function handleDeleteNote() {
        if (!note) return;

        try {
            setError("");
            await noteService.deleteNote(note._id);
            setNote(null);
            setNoteText("");
            setIsEditing(false);
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    return (
        <div className="notes-section">
            <h2>Private Note</h2>
            {error && <div className="inline-error">{error}</div>}
            {user ? (
                note ? (
                    !isEditing ? (
                        <div className="note-item">
                            <p>{note.text}</p>
                            <div className="note-actions">
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                                <button className="delete-btn" onClick={handleDeleteNote}>Delete</button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleAddOrEditNote} className="note-form">
                            <textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} />
                            <button type="submit">Save Note</button>
                            <button type="button" onClick={() => { setIsEditing(false); setNoteText(note.text); }}>Cancel</button>
                        </form>
                    )
                ) : (
                    <form onSubmit={handleAddOrEditNote} className="note-form">
                        <textarea placeholder="Write a private note..." value={noteText} onChange={(event) => setNoteText(event.target.value)} />
                        <button type="submit">Add Note</button>
                    </form>
                )
            ) : (
                <div className="login-prompt">Log in to create a private note for this recipe.</div>
            )}
        </div>
    );
}
