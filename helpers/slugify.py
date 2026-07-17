"""Convert text to URL-safe slugs."""

import re


def slugify(text: str) -> str:
    """
    Convert arbitrary text to a URL-safe slug.

    Converts to lowercase, replaces spaces and underscores with hyphens,
    and removes non-alphanumeric characters except hyphens.

    Args:
        text: Input text to slugify.

    Returns:
        URL-safe slug string.

    Example:
        >>> slugify("Hello World")
        'hello-world'
        >>> slugify("Test-Case_123")
        'test-case-123'
    """
    # Convert to lowercase
    text = text.lower()

    # Replace spaces and underscores with hyphens
    text = re.sub(r'[\s_]+', '-', text)

    # Remove all non-alphanumeric characters except hyphens
    text = re.sub(r'[^a-z0-9\-]', '', text)

    # Remove consecutive hyphens
    text = re.sub(r'-+', '-', text)

    # Strip leading and trailing hyphens
    text = text.strip('-')

    return text
