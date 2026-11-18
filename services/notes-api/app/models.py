"""Pydantic v2 request/response models for the notes API service."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from pydantic import BaseModel, Field


class NoteIn(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    body: str = Field(max_length=5000, default="")


class Note(BaseModel):
    id: str
    title: str
    body: str
    created_at: str
    updated_at: str

    @classmethod
    def new(cls, title: str, body: str) -> "Note":
        now = datetime.now(timezone.utc).isoformat()
        return cls(
            id=uuid4().hex,
            title=title,
            body=body,
            created_at=now,
            updated_at=now,
        )
