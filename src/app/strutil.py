"""String utility functions."""


def to_title(s: str) -> str:
    """Capitalize the first letter of each word in a string.

    Args:
        s: The input string.

    Returns:
        A string with the first letter of each word capitalized.

    Examples:
        >>> to_title("hello world")
        'Hello World'
        >>> to_title("")
        ''
    """
    if not s:
        return s
    return s.title()
