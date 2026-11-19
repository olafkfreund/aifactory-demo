# AC#5: DELETE /notes/{id} returns 204 and a subsequent GET returns 404;
# deleting an unknown id returns 404.

import os
import uuid

import requests


def _create_note():
    """Create a note with a unique title and return (base_url, note_id)."""
    base_url = os.environ["TFACTORY_TARGET_URL"]
    payload = {
        "title": f"delete-note-{uuid.uuid4()}",
        "body": f"body-{uuid.uuid4()}",
    }
    resp = requests.post(f"{base_url}/notes", json=payload, timeout=10)
    assert resp.status_code == 201
    note_id = resp.json()["id"]
    return base_url, note_id


def test_delete_note_existing_returns_204():
    base_url, note_id = _create_note()

    resp = requests.delete(f"{base_url}/notes/{note_id}", timeout=10)

    assert resp.status_code == 204


def test_delete_note_then_get_returns_404():
    base_url, note_id = _create_note()

    del_resp = requests.delete(f"{base_url}/notes/{note_id}", timeout=10)
    assert del_resp.status_code == 204

    get_resp = requests.get(f"{base_url}/notes/{note_id}", timeout=10)

    assert get_resp.status_code == 404


def test_delete_note_unknown_id_returns_404():
    base_url = os.environ["TFACTORY_TARGET_URL"]
    unknown_id = str(uuid.uuid4())

    resp = requests.delete(f"{base_url}/notes/{unknown_id}", timeout=10)

    assert resp.status_code == 404
