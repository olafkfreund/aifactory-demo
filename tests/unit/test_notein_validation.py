# Acceptance criterion (AC#7): Input validation limits — title length 1..100
# and body max length 5000 — are enforced by pydantic on NoteIn.

import pytest
from pydantic import ValidationError

from app.models import NoteIn


# --- title: valid boundary lengths (1 and 100) ---

@pytest.mark.parametrize(
    "title_len",
    [1, 100],
    ids=["title-min-1", "title-max-100"],
)
def test_notein_title_valid_boundary_lengths_accepted(title_len):
    note = NoteIn(title="t" * title_len, body="")
    assert len(note.title) == title_len


# --- title: invalid lengths (0 and 101) rejected by pydantic ---

@pytest.mark.parametrize(
    "title_len",
    [0, 101],
    ids=["title-too-short-0", "title-too-long-101"],
)
def test_notein_title_invalid_lengths_rejected(title_len):
    with pytest.raises(ValidationError):
        NoteIn(title="t" * title_len, body="")


# --- body: valid max length (5000) accepted ---

@pytest.mark.parametrize(
    "body_len",
    [0, 5000],
    ids=["body-empty", "body-max-5000"],
)
def test_notein_body_valid_lengths_accepted(body_len):
    note = NoteIn(title="valid title", body="b" * body_len)
    assert len(note.body) == body_len


# --- body: over max length (5001) rejected by pydantic ---

def test_notein_body_over_max_length_rejected():
    with pytest.raises(ValidationError):
        NoteIn(title="valid title", body="b" * 5001)
