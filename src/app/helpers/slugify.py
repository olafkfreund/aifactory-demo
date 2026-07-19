"""Slugify helper function for converting text to URL-safe slugs."""

import re
import unicodedata


def slugify(text: str) -> str:
    """
    Convert a string into a URL-safe slug.

    Converts to lowercase, normalizes unicode, collapses non-alphanumeric runs
    to single hyphens, and strips leading/trailing hyphens.

    Args:
        text: The input string to slugify.

    Returns:
        A URL-safe slug string, or empty string if input is empty/all-punctuation.
    """
    # Lowercase and strip whitespace
    text = text.lower().strip()

    # Normalize unicode to decomposed form (NFD) to handle accented characters
    text = unicodedata.normalize("NFD", text)
    # Remove combining diacritical marks (accents)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")

    # Replace runs of non-alphanumeric characters with a single hyphen
    text = re.sub(r"[^a-z0-9]+", "-", text)

    # Strip leading and trailing hyphens
    text = text.strip("-")

    return text
