# Criterion (AC#2, verbatim): "POST /notes with valid payload returns 201
# with a uuid id and timestamps; empty title or title over 100 chars returns 422."
#
# This test asserts the boundary EXACTLY as written in the criterion: the
# written title limit is 100 characters, so a title of 101 characters (one
# greater than the written limit of 100) must be rejected with HTTP 422, and
# an empty title must be rejected with HTTP 422.
#
# The number 100 comes SOLELY from the criterion text. The integer literal 101
# and the 101-character title string are hard-coded directly below. This test
# does NOT import NoteIn and does NOT read title's max_length / Field metadata /
# model_fields / json_schema or otherwise derive the boundary from the
# implementation. The criterion is asserted as written even if the running code
# would make the assertion fail.

from fastapi.testclient import TestClient

from app.main import app

# The written title limit from AC#2.
WRITTEN_TITLE_LIMIT = 100

# One character OVER the written limit of 100 -> 101 (hard-coded literal).
TITLE_OVER_LIMIT_LENGTH = 101

client = TestClient(app)


def test_create_note_empty_title_returns_422():
    response = client.post("/notes", json={"title": "", "body": "x"})
    assert response.status_code == 422


def test_create_note_title_over_100_chars_returns_422():
    # A title of exactly 101 characters: one greater than the written limit 100.
    over_limit_title = "a" * 101
    assert len(over_limit_title) == WRITTEN_TITLE_LIMIT + 1
    assert len(over_limit_title) == TITLE_OVER_LIMIT_LENGTH
    response = client.post("/notes", json={"title": over_limit_title, "body": "x"})
    assert response.status_code == 422
