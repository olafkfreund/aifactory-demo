# AC#3: GET /notes lists created notes; GET /notes/{id} returns the note;
# unknown id returns 404 with detail "note not found".

import os
import uuid

import requests


def _base_url():
    return os.environ["TFACTORY_TARGET_URL"]


def _create_note(base_url, title, body=""):
    resp = requests.post(
        f"{base_url}/notes",
        json={"title": title, "body": body},
        timeout=10,
    )
    assert resp.status_code == 201
    return resp.json()


def test_list_notes_returns_200():
    base_url = _base_url()
    resp = requests.get(f"{base_url}/notes", timeout=10)
    assert resp.status_code == 200


def test_list_notes_returns_list():
    base_url = _base_url()
    resp = requests.get(f"{base_url}/notes", timeout=10)
    assert isinstance(resp.json(), list)


def test_list_notes_includes_created_note():
    base_url = _base_url()
    created = _create_note(base_url, "list-include-title", "list-include-body")

    resp = requests.get(f"{base_url}/notes", timeout=10)
    assert resp.status_code == 200
    ids = [note["id"] for note in resp.json()]
    assert created["id"] in ids


def test_list_notes_preserves_insertion_order():
    base_url = _base_url()
    first = _create_note(base_url, "order-first")
    second = _create_note(base_url, "order-second")
    third = _create_note(base_url, "order-third")

    resp = requests.get(f"{base_url}/notes", timeout=10)
    assert resp.status_code == 200
    ids = [note["id"] for note in resp.json()]

    positions = [ids.index(first["id"]), ids.index(second["id"]), ids.index(third["id"])]
    assert positions == sorted(positions)


def test_get_note_by_id_returns_200():
    base_url = _base_url()
    created = _create_note(base_url, "get-by-id-title", "get-by-id-body")

    resp = requests.get(f"{base_url}/notes/{created['id']}", timeout=10)
    assert resp.status_code == 200


def test_get_note_by_id_returns_the_note():
    base_url = _base_url()
    created = _create_note(base_url, "get-returns-title", "get-returns-body")

    resp = requests.get(f"{base_url}/notes/{created['id']}", timeout=10)
    body = resp.json()
    assert body["id"] == created["id"]
    assert body["title"] == "get-returns-title"
    assert body["body"] == "get-returns-body"


def test_get_note_unknown_id_returns_404():
    base_url = _base_url()
    unknown_id = str(uuid.uuid4())

    resp = requests.get(f"{base_url}/notes/{unknown_id}", timeout=10)
    assert resp.status_code == 404


def test_get_note_unknown_id_returns_note_not_found_detail():
    base_url = _base_url()
    unknown_id = str(uuid.uuid4())

    resp = requests.get(f"{base_url}/notes/{unknown_id}", timeout=10)
    assert resp.json()["detail"] == "note not found"
