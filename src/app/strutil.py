"""String utility functions for the aifactory-demo application."""

import re


def to_snake(s: str) -> str:
    """Convert a string to snake_case.

    Handles camelCase, space-separated words, and mixed formats.

    Args:
        s: Input string to convert

    Returns:
        String converted to snake_case
    """
    if not s:
        return ""

    # Insert underscore before uppercase letters (except at start)
    s = re.sub(r'(?<!^)(?=[A-Z])', '_', s)
    # Replace spaces with underscores
    s = s.replace(' ', '_')
    # Convert to lowercase
    s = s.lower()
    # Clean up multiple consecutive underscores
    s = re.sub(r'_+', '_', s)

    return s
