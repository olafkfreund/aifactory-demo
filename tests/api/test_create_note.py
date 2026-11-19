# AC#2: POST /notes with valid payload returns 201 with a uuid id and timestamps.
#
# Verifies that POST /notes with a valid payload returns 201 and a note body
# carrying a uuid id, the submitted title and body, and created_at / updated_at
# timestamps.

import os
import uuid

import requests


def _base_url():
    return os.environ["TFACTORY_TARGET_URL"]


def _unique_title():
    return f"note-{uuid.uuid4()}"


def test_create_note_valid_payload_returns_201():
    base_url = _base_url()
    payload = {"title": _unique_title(), "body": "hello world"}

    resp = requests.post(f"{base_url}/notes", json=payload, timeout=10)

    assert resp.status_code == 201


def test_create_note_response_contains_uuid_id():
    base_url = _base_url()
    payload = {"title": _unique_title(), "body": "hello world"}

    resp = requests.post(f"{base_url}/notes", json=payload, timeout=10)
    data = resp.json()

    assert "id" in data
    # id must be a valid uuid4 string
    parsed = uuid.UUID(str(data["id"]))
    assert parsed.version == 4


def test_create_note_response_echoes_title_and_body():
    base_url = _base_url()
    title = _unique_title()
    payload = {"title": title, "body": "hello world"}

    resp = requests.post(f"{base_url}/notes", json=payload, timeout=10)
    data = resp.json()

    assert data["title"] == title
    assert data["body"] == "hello world"


def test_create_note_response_contains_timestamps():
    base_url = _base_url()
    payload = {"title": _unique_title(), "body": "hello world"}

    resp = requests.post(f"{base_url}/notes", json=payload, timeout=10)
    data = resp.json()

    assert "created_at" in data
    assert data["created_at"]
    assert "updated_at" in data
    assert data["updated_at"]
