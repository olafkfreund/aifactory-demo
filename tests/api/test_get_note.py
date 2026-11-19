# AC#3: GET /notes/{id} returns the note; unknown id returns 404 with detail
# "note not found".

import os
import uuid

import requests


def _unique_title():
    return f"note-{uuid.uuid4()}"


def test_get_note_existing_id_returns_the_note():
    base_url = os.environ["TFACTORY_TARGET_URL"]
    title = _unique_title()

    create = requests.post(
        f"{base_url}/notes",
        json={"title": title, "body": "hello world"},
        timeout=10,
    )
    assert create.status_code == 201
    created = create.json()
    note_id = created["id"]

    resp = requests.get(f"{base_url}/notes/{note_id}", timeout=10)

    assert resp.status_code == 200
    note = resp.json()
    assert note["id"] == note_id
    assert note["title"] == title
    assert note["body"] == "hello world"


def test_get_note_unknown_id_returns_404_note_not_found():
    base_url = os.environ["TFACTORY_TARGET_URL"]
    unknown_id = str(uuid.uuid4())

    resp = requests.get(f"{base_url}/notes/{unknown_id}", timeout=10)

    assert resp.status_code == 404
    assert resp.json()["detail"] == "note not found"
