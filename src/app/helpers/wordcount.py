"""Word counting utility for aifactory-demo."""


def word_count(s: str) -> int:
    """Count the number of words in a string.

    Args:
        s: Input string to count words in.

    Returns:
        Number of words in the string.
    """
    return len(s.split())
