"""Slugify utility for converting strings to URL-safe slugs."""

import re


def slugify(s: str) -> str:
    """Convert a string to a URL-safe slug.

    Lowercases, trims whitespace, and replaces runs of non-alphanumeric
    characters with a single hyphen.

    Args:
        s: The input string to slugify.

    Returns:
        A lowercased, hyphenated slug.
    """
    # Lowercase and strip leading/trailing whitespace
    s = s.lower().strip()

    # Replace runs of non-alphanumeric characters (except hyphens) with a single hyphen
    s = re.sub(r"[^a-z0-9-]+", "-", s)

    # Remove leading and trailing hyphens
    s = s.strip("-")

    return s
