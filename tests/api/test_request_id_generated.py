# AC#2: When a client sends no X-Request-ID, the gateway generates a UUID4
# and returns it in the response header.
#
# API lane (functional/HTTP): drive the running SUT over the network and
# assert that a request WITHOUT an X-Request-ID header comes back with an
# X-Request-ID response header whose value is a valid version-4 UUID.

import os
import uuid

import requests


def test_request_id_generated_when_absent_is_uuid4():
    base_url = os.environ["TFACTORY_TARGET_URL"]

    # Send no X-Request-ID header at all.
    resp = requests.get(f"{base_url}/healthz", timeout=10)

    assert resp.status_code == 200

    generated = resp.headers.get("X-Request-ID")
    assert generated is not None, "expected an X-Request-ID response header"

    # Must parse as a UUID and be version 4 (AC#2).
    parsed = uuid.UUID(generated)
    assert parsed.version == 4
    # The canonical string form round-trips, confirming a well-formed UUID4.
    assert str(parsed) == generated.lower()
