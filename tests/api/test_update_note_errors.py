# AC#4: PUT /notes/{id} replaces title/body and bumps updated_at;
# unknown id returns 404; invalid payload returns 422.
#
# This file covers the two error paths of AC#4:
#   - PUT against an unknown id returns 404.
#   - PUT with an invalid payload returns 422.

import os
import uuid

import pytest
import requests

TIMEOUT = 10


def _base_url():
    # Read the target URL at test time, never at import time.
    return os.environ["TFACTORY_TARGET_URL"].rstrip("/")


@pytest.fixture
def created_note():
    """Create a note with a unique title, yield it, then delete it."""
    base_url = _base_url()
    suffix = uuid.uuid4().hex
    payload = {"title": f"note-{suffix}", "body": f"body-{suffix}"}
    resp = requests.post(f"{base_url}/notes", json=payload, timeout=TIMEOUT)
    note = resp.json()
    yield note
    note_id = note.get("id")
    if note_id:
        requests.delete(f"{base_url}/notes/{note_id}", timeout=TIMEOUT)


def test_update_note_unknown_id_returns_404():
    base_url = _base_url()
    unknown_id = str(uuid.uuid4())
    payload = {"title": f"title-{uuid.uuid4().hex}", "body": "updated body"}
    resp = requests.put(
        f"{base_url}/notes/{unknown_id}", json=payload, timeout=TIMEOUT
    )
    assert resp.status_code == 404


def test_update_note_invalid_payload_returns_422(created_note):
    base_url = _base_url()
    note_id = created_note["id"]
    # Empty title violates the title 1..100 validation limit.
    invalid_payload = {"title": "", "body": "updated body"}
    resp = requests.put(
        f"{base_url}/notes/{note_id}", json=invalid_payload, timeout=TIMEOUT
    )
    assert resp.status_code == 422
