"""Pure text-to-slug conversion utility."""

import re
import unicodedata

_NON_ALPHANUMERIC_RUN = re.compile(r"[^a-z0-9]+")

MAX_SLUG_LENGTH = 200


def slugify(text: str) -> str:
    """Convert arbitrary text into a URL-safe slug.

    Steps:
    - NFKD-normalize and strip diacritics/accents (e.g. 'Café' -> 'cafe').
    - Lowercase.
    - Replace any run of non-alphanumeric characters with a single hyphen.
    - Strip leading/trailing hyphens.
    - Truncate to at most 200 characters, re-stripping any trailing hyphen
      left behind by truncation.

    Text with no alphanumeric characters at all (e.g. '!!!') normalizes to
    an empty string.
    """
    normalized = unicodedata.normalize("NFKD", text)
    without_accents = "".join(
        char for char in normalized if not unicodedata.combining(char)
    )
    lowered = without_accents.lower()
    hyphenated = _NON_ALPHANUMERIC_RUN.sub("-", lowered)
    stripped = hyphenated.strip("-")
    truncated = stripped[:MAX_SLUG_LENGTH]
    return truncated.rstrip("-")
