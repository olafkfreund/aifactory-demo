"""Titlecase helper for text formatting."""


def titlecase(s: str) -> str:
    """Convert a string to titlecase.

    Uppercases the first letter of each whitespace-separated word
    and lowercases the rest. Empty strings return empty strings.

    Args:
        s: The input string to titlecase.

    Returns:
        The titlecased string.
    """
    if not s:
        return s

    words = s.split()
    titlecased_words = [word[0].upper() + word[1:].lower() for word in words]
    return " ".join(titlecased_words)
