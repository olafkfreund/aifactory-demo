"""Slugify function for converting text to URL-safe slug format."""

import re


def slugify(text: str) -> str:
    """
    Convert text to a URL-safe slug format.

    Converts the input text to lowercase, replaces spaces and underscores with
    hyphens, removes non-alphanumeric characters (except hyphens), collapses
    consecutive hyphens, and strips leading/trailing hyphens.

    Args:
        text: The text to slugify.

    Returns:
        The slugified text, or empty string if input is empty.

    Examples:
        >>> slugify("Hello World")
        'hello-world'
        >>> slugify("Hello_World")
        'hello-world'
        >>> slugify("Hello  World")
        'hello-world'
        >>> slugify("")
        ''
    """
    if not text:
        return ""

    # Lowercase the text
    text = text.lower()

    # Replace spaces and underscores with hyphens
    text = re.sub(r'[\s_]+', '-', text)

    # Keep only alphanumeric characters and hyphens
    text = re.sub(r'[^a-z0-9\-]', '', text)

    # Collapse consecutive hyphens into single hyphen
    text = re.sub(r'-+', '-', text)

    # Strip leading and trailing hyphens
    text = text.strip('-')

    return text
