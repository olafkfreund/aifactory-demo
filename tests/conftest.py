"""Shared pytest fixtures and configuration."""

import os

import pytest


@pytest.fixture(scope="session")
def base_url() -> str:
    """Return the base URL for e2e tests.

    Set the ``TEST_SERVER_URL`` environment variable to point at a running
    server instance.  When the variable is absent every e2e test that
    depends on this fixture is automatically skipped.

    Example::

        TEST_SERVER_URL=http://localhost:8000 pytest -m e2e
    """
    url = os.environ.get("TEST_SERVER_URL", "").rstrip("/")
    if not url:
        pytest.skip(
            "TEST_SERVER_URL is not set — skipping e2e test. "
            "Start the server and export TEST_SERVER_URL=http://localhost:8000."
        )
    return url
