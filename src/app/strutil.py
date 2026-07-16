"""String utility functions for aifactory-demo."""


def to_title(s: str) -> str:
    """Convert a string to title case.

    Capitalizes the first letter of each word.

    Args:
        s: The input string

    Returns:
        The title case version of the string
    """
    if not s:
        return ""

    return " ".join(word.capitalize() for word in s.split())
