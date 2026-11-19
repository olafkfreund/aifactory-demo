# Acceptance criterion (AC#3): GET /notes/{id} returns the note;
# unknown id returns 404 with detail "note not found".

import os
import uuid

import requests


def _base_url():
    return os.environ["TFACTORY_TARGET_URL"]


def _make_note():
    """Create a note with unique data and return (id, created_json)."""
    base_url = _base_url()
    title = f"get-note-{uuid.uuid4()}"
    body = f"body-{uuid.uuid4()}"
    resp = requests.post(
        f"{base_url}/notes",
        json={"title": title, "body": body},
        timeout=10,
    )
    assert resp.status_code == 201, resp.text
    created = resp.json()
    return created["id"], created


def test_get_note_existing_id_returns_200():
    base_url = _base_url()
    note_id, _created = _make_note()

    resp = requests.get(f"{base_url}/notes/{note_id}", timeout=10)

    assert resp.status_code == 200


def test_get_note_existing_id_returns_the_note():
    base_url = _base_url()
    note_id, created = _make_note()

    resp = requests.get(f"{base_url}/notes/{note_id}", timeout=10)

    fetched = resp.json()
    assert fetched["id"] == note_id
    assert fetched["title"] == created["title"]
    assert fetched["body"] == created["body"]


def test_get_note_unknown_id_returns_404():
    base_url = _base_url()
    unknown_id = str(uuid.uuid4())

    resp = requests.get(f"{base_url}/notes/{unknown_id}", timeout=10)

    assert resp.status_code == 404


def test_get_note_unknown_id_returns_detail_note_not_found():
    base_url = _base_url()
    unknown_id = str(uuid.uuid4())

    resp = requests.get(f"{base_url}/notes/{unknown_id}", timeout=10)

    assert resp.json()["detail"] == "note not found"
