"""Word counting utilities."""


def word_count(s: str) -> int:
    """Count the number of words in a string.

    Args:
        s: The input string to count words in.

    Returns:
        The number of words (whitespace-separated tokens) in the string.
        Returns 0 for empty strings or strings containing only whitespace.
    """
    return len(s.split())
