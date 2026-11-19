# AC#4: PUT /notes/{id} replaces title/body and bumps updated_at;
# unknown id returns 404; invalid payload returns 422.

import os
import uuid

import pytest
import requests


def _base_url():
    return os.environ["TFACTORY_TARGET_URL"]


def _create_note(base_url):
    title = f"original-{uuid.uuid4()}"
    body = f"original-body-{uuid.uuid4()}"
    resp = requests.post(
        f"{base_url}/notes",
        json={"title": title, "body": body},
        timeout=10,
    )
    assert resp.status_code == 201
    return resp.json()


def test_update_note_replaces_title():
    base_url = _base_url()
    created = _create_note(base_url)
    note_id = created["id"]

    new_title = f"updated-{uuid.uuid4()}"
    new_body = f"updated-body-{uuid.uuid4()}"
    resp = requests.put(
        f"{base_url}/notes/{note_id}",
        json={"title": new_title, "body": new_body},
        timeout=10,
    )

    assert resp.status_code == 200
    assert resp.json()["title"] == new_title


def test_update_note_replaces_body():
    base_url = _base_url()
    created = _create_note(base_url)
    note_id = created["id"]

    new_title = f"updated-{uuid.uuid4()}"
    new_body = f"updated-body-{uuid.uuid4()}"
    resp = requests.put(
        f"{base_url}/notes/{note_id}",
        json={"title": new_title, "body": new_body},
        timeout=10,
    )

    assert resp.status_code == 200
    assert resp.json()["body"] == new_body


def test_update_note_bumps_updated_at():
    base_url = _base_url()
    created = _create_note(base_url)
    note_id = created["id"]

    new_title = f"updated-{uuid.uuid4()}"
    new_body = f"updated-body-{uuid.uuid4()}"
    resp = requests.put(
        f"{base_url}/notes/{note_id}",
        json={"title": new_title, "body": new_body},
        timeout=10,
    )

    assert resp.status_code == 200
    assert resp.json()["updated_at"] != created["updated_at"]


def test_update_note_unknown_id_returns_404():
    base_url = _base_url()
    unknown_id = str(uuid.uuid4())

    resp = requests.put(
        f"{base_url}/notes/{unknown_id}",
        json={"title": f"t-{uuid.uuid4()}", "body": "b"},
        timeout=10,
    )

    assert resp.status_code == 404


def test_update_note_invalid_payload_returns_422():
    base_url = _base_url()
    created = _create_note(base_url)
    note_id = created["id"]

    resp = requests.put(
        f"{base_url}/notes/{note_id}",
        json={"title": "", "body": "b"},
        timeout=10,
    )

    assert resp.status_code == 422
