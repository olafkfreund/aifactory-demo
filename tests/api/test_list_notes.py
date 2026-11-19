# AC#3: GET /notes lists created notes.
# Verify GET /notes lists previously created notes in insertion order.

import os
import uuid

import requests


def test_list_notes_returns_created_notes_in_insertion_order():
    base_url = os.environ["TFACTORY_TARGET_URL"]

    # Create our own notes with unique titles so we can find them regardless
    # of any other data already in the shared store.
    run_id = uuid.uuid4().hex
    titles = [f"note-{run_id}-{i}" for i in range(3)]

    created_ids = []
    for title in titles:
        resp = requests.post(
            f"{base_url}/notes",
            json={"title": title, "body": "listing test body"},
            timeout=10,
        )
        assert resp.status_code == 201
        created_ids.append(resp.json()["id"])

    # GET /notes lists created notes.
    list_resp = requests.get(f"{base_url}/notes", timeout=10)
    assert list_resp.status_code == 200

    notes = list_resp.json()
    assert isinstance(notes, list)

    # Every note we created must be present in the listing.
    listed_ids = [note["id"] for note in notes]
    for created_id in created_ids:
        assert created_id in listed_ids

    # The notes we created appear in insertion order.
    our_order = [note["id"] for note in notes if note["id"] in set(created_ids)]
    assert our_order == created_ids
