"""dedupe_spaces: Collapse runs of whitespace to single space."""


def dedupe_spaces(text: str) -> str:
    """
    Collapse runs of whitespace to a single space and strip leading/trailing.

    Args:
        text: Input text string

    Returns:
        String with collapsed whitespace and stripped leading/trailing spaces

    Examples:
        >>> dedupe_spaces("  hello   world  ")
        'hello world'
        >>> dedupe_spaces("hello")
        'hello'
        >>> dedupe_spaces("")
        ''
    """
    if not text:
        return ""

    # Split on any whitespace (handles spaces, tabs, newlines, etc.)
    # and rejoin with single spaces
    words = text.split()
    return " ".join(words)
