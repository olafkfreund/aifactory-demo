# AC#3: GET /notes lists created notes (in insertion order).
#
# Verifies that notes created via POST /notes appear in the GET /notes
# listing, in the order in which they were created (insertion order).

import os
import uuid

import requests

TIMEOUT = 10


def _base_url():
    return os.environ["TFACTORY_TARGET_URL"]


def test_list_notes_returns_created_notes():
    """GET /notes returns 200 and includes notes that were created."""
    base_url = _base_url()
    suffix = uuid.uuid4().hex

    title = f"note-{suffix}"
    create_resp = requests.post(
        f"{base_url}/notes",
        json={"title": title, "body": "hello"},
        timeout=TIMEOUT,
    )
    assert create_resp.status_code == 201
    created_id = create_resp.json()["id"]

    list_resp = requests.get(f"{base_url}/notes", timeout=TIMEOUT)
    assert list_resp.status_code == 200

    notes = list_resp.json()
    assert isinstance(notes, list)

    ids = [note["id"] for note in notes]
    assert created_id in ids


def test_list_notes_preserves_insertion_order():
    """GET /notes lists created notes in insertion order."""
    base_url = _base_url()
    suffix = uuid.uuid4().hex

    created_ids = []
    for index in range(3):
        resp = requests.post(
            f"{base_url}/notes",
            json={"title": f"note-{suffix}-{index}", "body": f"body-{index}"},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 201
        created_ids.append(resp.json()["id"])

    list_resp = requests.get(f"{base_url}/notes", timeout=TIMEOUT)
    assert list_resp.status_code == 200

    notes = list_resp.json()
    all_ids = [note["id"] for note in notes]

    # Keep only the ids this test created, preserving listing order.
    observed_order = [note_id for note_id in all_ids if note_id in set(created_ids)]
    assert observed_order == created_ids
