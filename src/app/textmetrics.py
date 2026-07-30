"""Pure-stdlib text metric helpers.

Small, dependency-free utilities for measuring text: counting words,
estimating reading time, and turning arbitrary strings into URL-friendly
slugs. Only the standard library (:mod:`re`, :mod:`math`) is used.
"""

from __future__ import annotations

import math
import re

# Runs of one-or-more non-alphanumeric characters (unicode-aware). ``\W`` is
# the complement of ``\w`` (unicode letters, digits, underscore); underscore is
# added explicitly so it acts as a separator too, leaving slugs with only
# letters, digits, and hyphens.
_SLUG_SEPARATOR = re.compile(r"[\W_]+", flags=re.UNICODE)


def word_count(s: str) -> int:
    """Return the number of whitespace-separated tokens in ``s``.

    Empty or whitespace-only input yields ``0``.
    """
    return len(s.split())


def reading_time_minutes(s: str, wpm: int = 200) -> int:
    """Estimate reading time for ``s`` in whole minutes.

    ``wpm`` is the assumed reading speed in words per minute and must be
    positive; it is validated before anything else so a non-positive value
    raises :class:`ValueError` even for empty ``s``.

    Returns ``0`` when there are no words, otherwise at least ``1`` minute.
    """
    if wpm <= 0:
        raise ValueError(f"wpm must be positive, got {wpm}")
    words = word_count(s)
    if words == 0:
        return 0
    return max(1, math.ceil(words / wpm))


def slugify(s: str) -> str:
    """Convert ``s`` into a lowercase, hyphen-separated slug.

    Lowercases the string, replaces runs of non-alphanumeric characters
    (unicode-aware) with a single hyphen, and strips leading/trailing
    hyphens.
    """
    slug = _SLUG_SEPARATOR.sub("-", s.lower())
    return slug.strip("-")
