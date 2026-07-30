"""Thread-safe in-memory link store for the link shortener service.

All state lives in process memory and is guarded by a single
``threading.Lock`` so create/delete operations are atomic.

The store raises :class:`LinkNotFound` so the HTTP layer can translate
it into a 404 response.
"""

from __future__ import annotations

import secrets
import string
import threading
from dataclasses import dataclass

_ALPHABET = string.ascii_lowercase + string.digits
_CODE_LEN = 7


class LinkNotFound(Exception):
    """Raised when a requested code does not exist."""


@dataclass
class _Link:
    code: str
    url: str
    hits: int = 0


class LinkStore:
    """In-memory store for shortened links."""

    def __init__(self) -> None:
        self._links: dict[str, _Link] = {}
        self._lock = threading.Lock()

    def _generate_code(self) -> str:
        """Return a unique 7-character lowercase-alphanumeric code."""
        while True:
            code = "".join(secrets.choice(_ALPHABET) for _ in range(_CODE_LEN))
            if code not in self._links:
                return code

    def create_link(self, url: str) -> dict:
        with self._lock:
            code = self._generate_code()
            self._links[code] = _Link(code=code, url=url)
            return {"code": code, "url": url}

    def get_link(self, code: str) -> dict:
        with self._lock:
            link = self._links.get(code)
            if link is None:
                raise LinkNotFound(f"unknown code: {code}")
            return {"code": link.code, "url": link.url}

    def get_link_stats(self, code: str) -> dict:
        with self._lock:
            link = self._links.get(code)
            if link is None:
                raise LinkNotFound(f"unknown code: {code}")
            return {"code": link.code, "url": link.url, "hits": link.hits}

    def record_hit(self, code: str) -> str:
        """Increment hit counter and return the original URL."""
        with self._lock:
            link = self._links.get(code)
            if link is None:
                raise LinkNotFound(f"unknown code: {code}")
            link.hits += 1
            return link.url

    def delete_link(self, code: str) -> None:
        with self._lock:
            if code not in self._links:
                raise LinkNotFound(f"unknown code: {code}")
            del self._links[code]


# Process-wide singleton shared across requests.
link_store = LinkStore()
