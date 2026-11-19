# AC#2: POST /notes with valid payload returns 201 with a uuid id and timestamps.
#
# This test drives a running instance of the Notes API over HTTP and verifies
# that creating a note with a valid payload returns HTTP 201 and a body that
# contains a uuid4 `id`, the submitted `title` and `body`, plus `created_at`
# and `updated_at` timestamps.

import os
import uuid

import requests


def _base_url():
    return os.environ["TFACTORY_TARGET_URL"]


def test_create_note_valid_payload_returns_201():
    base_url = _base_url()
    unique_title = f"note-{uuid.uuid4()}"
    payload = {"title": unique_title, "body": "hello world"}

    resp = requests.post(f"{base_url}/notes", json=payload, timeout=10)

    assert resp.status_code == 201


def test_create_note_response_contains_submitted_title_and_body():
    base_url = _base_url()
    unique_title = f"note-{uuid.uuid4()}"
    body_text = f"body-{uuid.uuid4()}"
    payload = {"title": unique_title, "body": body_text}

    resp = requests.post(f"{base_url}/notes", json=payload, timeout=10)
    data = resp.json()

    assert data["title"] == unique_title
    assert data["body"] == body_text


def test_create_note_response_id_is_uuid4():
    base_url = _base_url()
    unique_title = f"note-{uuid.uuid4()}"
    payload = {"title": unique_title, "body": "hello world"}

    resp = requests.post(f"{base_url}/notes", json=payload, timeout=10)
    data = resp.json()

    assert "id" in data
    parsed = uuid.UUID(str(data["id"]))
    assert parsed.version == 4


def test_create_note_response_contains_timestamps():
    base_url = _base_url()
    unique_title = f"note-{uuid.uuid4()}"
    payload = {"title": unique_title, "body": "hello world"}

    resp = requests.post(f"{base_url}/notes", json=payload, timeout=10)
    data = resp.json()

    assert "created_at" in data
    assert "updated_at" in data
    assert data["created_at"] is not None
    assert data["updated_at"] is not None
