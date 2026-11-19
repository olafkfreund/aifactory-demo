"""API tests for the notes service.

An autouse fixture resets the process-wide in-memory store before each
test so state never leaks between tests.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from app import store
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def _reset_store():
    store._reset()
    yield
    store._reset()


def _create_note(title: str = "Title", body: str = "Body") -> dict:
    r = client.post("/notes", json={"title": title, "body": body})
    assert r.status_code == 201
    return r.json()


# health ------------------------------------------------------------------
def test_health_returns_ok():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


# create --------------------------------------------------------------------
def test_create_note_valid_returns_201_with_uuid_id_and_timestamps():
    note = _create_note("My Title", "My body")

    assert note["title"] == "My Title"
    assert note["body"] == "My body"

    # id should be a canonical uuid4 string (as produced by str(uuid4())).
    assert str(uuid.UUID(note["id"], version=4)) == note["id"]

    assert note["created_at"] == note["updated_at"]
    for key in ("created_at", "updated_at"):
        assert datetime.fromisoformat(note[key]).utcoffset() == timedelta(0)


def test_create_note_without_body_defaults_to_empty_string():
    r = client.post("/notes", json={"title": "Only title"})
    assert r.status_code == 201
    assert r.json()["body"] == ""


def test_create_note_with_empty_title_returns_422():
    r = client.post("/notes", json={"title": "", "body": "Body"})
    assert r.status_code == 422


def test_create_note_with_title_over_100_chars_returns_422():
    r = client.post("/notes", json={"title": "a" * 101, "body": "Body"})
    assert r.status_code == 422


def test_create_note_with_title_of_exactly_100_chars_succeeds():
    r = client.post("/notes", json={"title": "a" * 100, "body": "Body"})
    assert r.status_code == 201
    assert r.json()["title"] == "a" * 100


def test_create_note_with_body_over_5000_chars_returns_422():
    r = client.post("/notes", json={"title": "Title", "body": "a" * 5001})
    assert r.status_code == 422


# list ------------------------------------------------------------------
def test_list_notes_returns_created_notes_in_insertion_order():
    first = _create_note("First", "1")
    second = _create_note("Second", "2")
    third = _create_note("Third", "3")

    r = client.get("/notes")
    assert r.status_code == 200
    ids = [n["id"] for n in r.json()]
    assert ids == [first["id"], second["id"], third["id"]]


# get ------------------------------------------------------------------
def test_get_note_found():
    created = _create_note()

    r = client.get(f"/notes/{created['id']}")
    assert r.status_code == 200
    assert r.json() == created


def test_get_note_unknown_id_returns_404():
    r = client.get(f"/notes/{uuid.uuid4().hex}")
    assert r.status_code == 404
    assert r.json() == {"detail": "note not found"}


# update ------------------------------------------------------------------
def test_update_note_success():
    created = _create_note("Original", "Body")

    r = client.put(
        f"/notes/{created['id']}", json={"title": "Updated", "body": "New body"}
    )
    assert r.status_code == 200
    updated = r.json()

    assert updated["id"] == created["id"]
    assert updated["created_at"] == created["created_at"]
    assert updated["title"] == "Updated"
    assert updated["body"] == "New body"
    assert datetime.fromisoformat(updated["updated_at"]) > datetime.fromisoformat(
        created["updated_at"]
    )


def test_update_note_unknown_id_returns_404():
    r = client.put(
        f"/notes/{uuid.uuid4().hex}", json={"title": "Updated", "body": "Body"}
    )
    assert r.status_code == 404
    assert r.json() == {"detail": "note not found"}


def test_update_note_with_invalid_payload_returns_422():
    created = _create_note()

    r = client.put(f"/notes/{created['id']}", json={"title": "", "body": "Body"})
    assert r.status_code == 422


# delete ------------------------------------------------------------------
def test_delete_note_then_get_returns_404():
    created = _create_note()

    r = client.delete(f"/notes/{created['id']}")
    assert r.status_code == 204

    r = client.get(f"/notes/{created['id']}")
    assert r.status_code == 404
    assert r.json() == {"detail": "note not found"}


def test_delete_note_unknown_id_returns_404():
    r = client.delete(f"/notes/{uuid.uuid4().hex}")
    assert r.status_code == 404
    assert r.json() == {"detail": "note not found"}


# integration ---------------------------------------------------------------
def test_full_crud_lifecycle():
    r = client.post("/notes", json={"title": "Groceries", "body": "milk, eggs"})
    assert r.status_code == 201
    created = r.json()
    note_id = created["id"]

    r = client.get("/notes")
    assert r.status_code == 200
    assert [n["id"] for n in r.json()] == [note_id]

    r = client.get(f"/notes/{note_id}")
    assert r.status_code == 200
    assert r.json() == created

    r = client.put(f"/notes/{note_id}", json={"title": "Groceries v2", "body": "milk"})
    assert r.status_code == 200
    updated = r.json()
    assert updated["id"] == note_id
    assert updated["title"] == "Groceries v2"
    assert updated["body"] == "milk"
    assert updated["created_at"] == created["created_at"]
    assert datetime.fromisoformat(updated["updated_at"]) > datetime.fromisoformat(
        created["updated_at"]
    )

    r = client.delete(f"/notes/{note_id}")
    assert r.status_code == 204
    assert r.content == b""

    r = client.get(f"/notes/{note_id}")
    assert r.status_code == 404
    assert r.json() == {"detail": "note not found"}
