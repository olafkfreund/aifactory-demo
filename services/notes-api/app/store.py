"""In-memory note store.

A simple module-level, insertion-ordered dict keyed by note id. This is
pure data access with no FastAPI or HTTP concerns - ``main.py`` is
responsible for translating these results into HTTP responses.
"""

from __future__ import annotations

from datetime import datetime, timezone

from app.models import Note, NoteIn

_notes: dict[str, Note] = {}


def list_all() -> list[Note]:
    """Return all notes in insertion order."""
    return list(_notes.values())


def get(note_id: str) -> Note | None:
    """Return the note with the given id, or None if it does not exist."""
    return _notes.get(note_id)


def create(note_in: NoteIn) -> Note:
    """Create a new note and store it."""
    note = Note.new(title=note_in.title, body=note_in.body)
    _notes[note.id] = note
    return note


def update(note_id: str, note_in: NoteIn) -> Note | None:
    """Replace title/body of an existing note, preserving id and created_at.

    Returns the updated note, or None if the note does not exist.
    """
    existing = _notes.get(note_id)
    if existing is None:
        return None
    updated = Note(
        id=existing.id,
        title=note_in.title,
        body=note_in.body,
        created_at=existing.created_at,
        updated_at=datetime.now(timezone.utc).isoformat(),
    )
    _notes[note_id] = updated
    return updated


def delete(note_id: str) -> bool:
    """Delete the note with the given id. Returns True if it existed."""
    return _notes.pop(note_id, None) is not None


def _reset() -> None:
    """Clear all notes. Intended for test isolation."""
    _notes.clear()
