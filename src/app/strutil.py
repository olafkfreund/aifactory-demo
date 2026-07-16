"""String utility functions for aifactory-demo."""

import re


def to_kebab(s: str) -> str:
    """Convert a string to kebab-case.

    Handles camelCase, space-separated, and mixed-case strings.
    Returns an empty string for empty input.

    Args:
        s: The input string to convert

    Returns:
        The string converted to kebab-case
    """
    if not s:
        return ""

    # Insert hyphens before uppercase letters that follow lowercase letters
    s = re.sub(r"([a-z])([A-Z])", r"\1-\2", s)

    # Replace spaces with hyphens
    s = s.replace(" ", "-")

    # Convert to lowercase
    s = s.lower()

    return s
