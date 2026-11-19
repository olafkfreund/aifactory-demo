# AC#4: PUT /notes/{id} replaces title/body and bumps updated_at;
# unknown id returns 404; invalid payload returns 422.
#
# This file verifies the error branches of AC#4 only:
#   - PUT against an unknown id returns 404.
#   - PUT with an invalid payload returns 422.

import os
import uuid

import pytest
import requests

# Target: services/notes-api/app/main.py::update_note
# Import root is `app`; this API lane drives the running SUT over HTTP, so the
# target is exercised through PUT /notes/{id} rather than imported directly.

TIMEOUT = 10


def _base_url():
    return os.environ["TFACTORY_TARGET_URL"]


def _create_note():
    """Create a note with a unique title and return its JSON body."""
    base_url = _base_url()
    payload = {
        "title": f"note-{uuid.uuid4()}",
        "body": "original body",
    }
    resp = requests.post(f"{base_url}/notes", json=payload, timeout=TIMEOUT)
    assert resp.status_code == 201, resp.text
    return resp.json()


def test_update_note_unknown_id_returns_404():
    base_url = _base_url()
    unknown_id = str(uuid.uuid4())
    resp = requests.put(
        f"{base_url}/notes/{unknown_id}",
        json={"title": "replacement title", "body": "replacement body"},
        timeout=TIMEOUT,
    )
    assert resp.status_code == 404


@pytest.mark.parametrize(
    "payload",
    [
        {"title": "", "body": "some body"},
        {"title": "x" * 101, "body": "some body"},
    ],
    ids=["empty-title", "title-over-100-chars"],
)
def test_update_note_invalid_payload_returns_422(payload):
    note = _create_note()
    base_url = _base_url()
    resp = requests.put(
        f"{base_url}/notes/{note['id']}",
        json=payload,
        timeout=TIMEOUT,
    )
    assert resp.status_code == 422
