# AC#4: PUT /notes/{id} replaces title/body and bumps updated_at;
#        unknown id returns 404; invalid payload returns 422.

import os
import uuid

import requests

TIMEOUT = 10


def _base_url():
    return os.environ["TFACTORY_TARGET_URL"]


def _create_note(base_url, title=None, body=None):
    if title is None:
        title = f"original-title-{uuid.uuid4()}"
    if body is None:
        body = f"original-body-{uuid.uuid4()}"
    resp = requests.post(
        f"{base_url}/notes",
        json={"title": title, "body": body},
        timeout=TIMEOUT,
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def test_update_note_replaces_title_returns_200():
    base_url = _base_url()
    note = _create_note(base_url)
    note_id = note["id"]

    new_title = f"replaced-title-{uuid.uuid4()}"
    new_body = f"replaced-body-{uuid.uuid4()}"
    resp = requests.put(
        f"{base_url}/notes/{note_id}",
        json={"title": new_title, "body": new_body},
        timeout=TIMEOUT,
    )

    assert resp.status_code == 200, resp.text
    assert resp.json()["title"] == new_title


def test_update_note_replaces_body_returns_200():
    base_url = _base_url()
    note = _create_note(base_url)
    note_id = note["id"]

    new_title = f"replaced-title-{uuid.uuid4()}"
    new_body = f"replaced-body-{uuid.uuid4()}"
    resp = requests.put(
        f"{base_url}/notes/{note_id}",
        json={"title": new_title, "body": new_body},
        timeout=TIMEOUT,
    )

    assert resp.status_code == 200, resp.text
    assert resp.json()["body"] == new_body


def test_update_note_keeps_same_id():
    base_url = _base_url()
    note = _create_note(base_url)
    note_id = note["id"]

    resp = requests.put(
        f"{base_url}/notes/{note_id}",
        json={
            "title": f"replaced-title-{uuid.uuid4()}",
            "body": f"replaced-body-{uuid.uuid4()}",
        },
        timeout=TIMEOUT,
    )

    assert resp.status_code == 200, resp.text
    assert resp.json()["id"] == note_id


def test_update_note_bumps_updated_at():
    base_url = _base_url()
    note = _create_note(base_url)
    note_id = note["id"]
    original_updated_at = note["updated_at"]

    resp = requests.put(
        f"{base_url}/notes/{note_id}",
        json={
            "title": f"replaced-title-{uuid.uuid4()}",
            "body": f"replaced-body-{uuid.uuid4()}",
        },
        timeout=TIMEOUT,
    )

    assert resp.status_code == 200, resp.text
    assert resp.json()["updated_at"] != original_updated_at


def test_update_note_unknown_id_returns_404():
    base_url = _base_url()
    unknown_id = str(uuid.uuid4())

    resp = requests.put(
        f"{base_url}/notes/{unknown_id}",
        json={
            "title": f"some-title-{uuid.uuid4()}",
            "body": f"some-body-{uuid.uuid4()}",
        },
        timeout=TIMEOUT,
    )

    assert resp.status_code == 404, resp.text


def test_update_note_invalid_payload_returns_422():
    base_url = _base_url()
    note = _create_note(base_url)
    note_id = note["id"]

    resp = requests.put(
        f"{base_url}/notes/{note_id}",
        json={"title": "", "body": f"some-body-{uuid.uuid4()}"},
        timeout=TIMEOUT,
    )

    assert resp.status_code == 422, resp.text
