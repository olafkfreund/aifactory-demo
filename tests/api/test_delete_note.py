# AC#5: DELETE /notes/{id} returns 204 and a subsequent GET returns 404;
# an unknown id returns 404.

import os
import uuid

import requests

TIMEOUT = 10


def _create_note():
    """Create a note over HTTP and return (base_url, note_id)."""
    base_url = os.environ["TFACTORY_TARGET_URL"]
    payload = {
        "title": f"delete-me-{uuid.uuid4()}",
        "body": f"body-{uuid.uuid4()}",
    }
    resp = requests.post(f"{base_url}/notes", json=payload, timeout=TIMEOUT)
    assert resp.status_code == 201, resp.text
    note_id = resp.json()["id"]
    return base_url, note_id


def test_delete_note_existing_returns_204():
    base_url, note_id = _create_note()

    resp = requests.delete(f"{base_url}/notes/{note_id}", timeout=TIMEOUT)

    assert resp.status_code == 204


def test_delete_note_then_get_returns_404():
    base_url, note_id = _create_note()

    delete_resp = requests.delete(f"{base_url}/notes/{note_id}", timeout=TIMEOUT)
    assert delete_resp.status_code == 204

    get_resp = requests.get(f"{base_url}/notes/{note_id}", timeout=TIMEOUT)

    assert get_resp.status_code == 404


def test_delete_note_unknown_id_returns_404():
    base_url = os.environ["TFACTORY_TARGET_URL"]
    unknown_id = str(uuid.uuid4())

    resp = requests.delete(f"{base_url}/notes/{unknown_id}", timeout=TIMEOUT)

    assert resp.status_code == 404
