"""FastAPI application for the notes API service.

This module instantiates the FastAPI app and wires up all HTTP routes.
It is the only place that translates store.py results into HTTP status
codes/exceptions - store.py itself has no FastAPI or HTTP concerns.
"""

from __future__ import annotations

from fastapi import FastAPI, HTTPException, Response

from app import store
from app.models import Note, NoteIn

NOTE_NOT_FOUND = "note not found"

app = FastAPI(title="notes-api")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/notes", response_model=Note, status_code=201)
async def create_note(body: NoteIn) -> Note:
    return store.create(body)


@app.get("/notes", response_model=list[Note])
async def list_notes() -> list[Note]:
    return store.list_all()


@app.get("/notes/{note_id}", response_model=Note)
async def get_note(note_id: str) -> Note:
    note = store.get(note_id)
    if note is None:
        raise HTTPException(status_code=404, detail=NOTE_NOT_FOUND)
    return note


@app.put("/notes/{note_id}", response_model=Note)
async def update_note(note_id: str, body: NoteIn) -> Note:
    updated = store.update(note_id, body)
    if updated is None:
        raise HTTPException(status_code=404, detail=NOTE_NOT_FOUND)
    return updated


@app.delete("/notes/{note_id}", status_code=204)
async def delete_note(note_id: str) -> Response:
    deleted = store.delete(note_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=NOTE_NOT_FOUND)
    return Response(status_code=204)
