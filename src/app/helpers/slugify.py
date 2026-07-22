"""URL-safe slug conversion helper."""

import re
import unicodedata


def slugify(text: str) -> str:
    """
    Convert a string into a URL-safe slug.

    - Lowercases the input and trims surrounding whitespace
    - Runs of non-alphanumeric characters collapse to a single hyphen
    - Leading/trailing hyphens are stripped
    - Unicode letters are handled and never crash
    - Empty or all-punctuation input returns an empty string

    Args:
        text: The text to slugify.

    Returns:
        A URL-safe slug string.
    """
    # Normalize unicode and strip whitespace
    text = text.strip()
    if not text:
        return ""

    # Normalize unicode characters to NFD (decomposed) form
    # This allows us to separate base characters from diacritics
    text = unicodedata.normalize("NFD", text)

    # Remove combining marks (accents, etc.) but keep base characters
    text = "".join(
        char for char in text
        if unicodedata.category(char) != "Mn"
    )

    # Lowercase
    text = text.lower()

    # Replace runs of non-alphanumeric characters with a single hyphen
    text = re.sub(r"[^a-z0-9]+", "-", text)

    # Strip leading and trailing hyphens
    text = text.strip("-")

    return text
