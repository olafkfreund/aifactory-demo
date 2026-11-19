"""Pure-stdlib URL-slug generation with accent-folding and length limits.

A single dependency-free helper for turning arbitrary text into a
lowercase, hyphen-separated slug (``"Crème Brûlée!"`` -> ``"creme-brulee"``),
optionally truncated to a maximum length on a word (hyphen) boundary. Only
the standard library (:mod:`re`, :mod:`unicodedata`) is used.
"""

from __future__ import annotations

import re
import unicodedata

# Runs of one-or-more non-alphanumeric ASCII characters. Applied after
# accent-folding, so this only ever sees plain ASCII letters/digits plus
# punctuation and whitespace, which it collapses into a single hyphen.
_SLUG_SEPARATOR = re.compile(r"[^a-z0-9]+")


def slugify(text: str, max_length: int | None = None) -> str:
    """Convert ``text`` into a lowercase, hyphen-separated slug.

    Accents and other combining diacritics are folded away via NFKD
    normalization (``"Café"`` -> ``"cafe"``), the result is lowercased, and
    runs of non-alphanumeric characters are replaced with a single hyphen
    with leading/trailing hyphens trimmed. Empty or all-symbol input returns
    ``""``.

    ``max_length`` (default ``None`` for unlimited) caps the result length.
    It must be positive; zero or negative values raise :class:`ValueError`,
    checked up front regardless of ``text``. When the slug is longer than
    ``max_length``, it is cut at a hyphen (word) boundary so the result is
    never longer than ``max_length`` and never ends mid-word or with a
    trailing hyphen. If the first word alone exceeds ``max_length``, it is
    hard-cut to exactly ``max_length`` characters.
    """
    if max_length is not None and max_length <= 0:
        raise ValueError(f"max_length must be positive, got {max_length}")

    folded = unicodedata.normalize("NFKD", text)
    folded = "".join(ch for ch in folded if not unicodedata.combining(ch))
    slug = _SLUG_SEPARATOR.sub("-", folded.lower()).strip("-")

    if max_length is None or len(slug) <= max_length:
        return slug

    truncated = slug[:max_length]
    if slug[max_length] == "-":
        # The cut lands exactly on a word boundary; nothing more to trim.
        return truncated
    if "-" not in truncated:
        # The first word alone exceeds max_length: hard-cut it.
        return truncated

    cut = truncated.rfind("-")
    return truncated[:cut]
