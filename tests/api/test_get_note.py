# Acceptance criterion (AC#3): GET /notes lists created notes; GET /notes/{id}
# returns the note; unknown id returns 404 with detail "note not found".
#
# This file verifies the GET /notes/{id} portion: fetching the created note by
# its id returns it, and an unknown id returns 404 with detail "note not found".

import os
import uuid

import requests


def _create_note(base_url):
    """Create a note via POST /notes and return the parsed response body."""
    payload = {"title": "My note", "body": "some body text"}
    resp = requests.post(f"{base_url}/notes", json=payload, timeout=10)
    assert resp.status_code == 201
    return resp.json()


def test_get_note_existing_id_returns_200():
    base_url = os.environ["TFACTORY_TARGET_URL"]
    created = _create_note(base_url)

    resp = requests.get(f"{base_url}/notes/{created['id']}", timeout=10)

    assert resp.status_code == 200


def test_get_note_existing_id_returns_created_note():
    base_url = os.environ["TFACTORY_TARGET_URL"]
    created = _create_note(base_url)

    resp = requests.get(f"{base_url}/notes/{created['id']}", timeout=10)
    fetched = resp.json()

    assert fetched["id"] == created["id"]
    assert fetched["title"] == created["title"]
    assert fetched["body"] == created["body"]


def test_get_note_unknown_id_returns_404():
    base_url = os.environ["TFACTORY_TARGET_URL"]
    unknown_id = str(uuid.uuid4())

    resp = requests.get(f"{base_url}/notes/{unknown_id}", timeout=10)

    assert resp.status_code == 404


def test_get_note_unknown_id_returns_note_not_found_detail():
    base_url = os.environ["TFACTORY_TARGET_URL"]
    unknown_id = str(uuid.uuid4())

    resp = requests.get(f"{base_url}/notes/{unknown_id}", timeout=10)

    assert resp.json()["detail"] == "note not found"
