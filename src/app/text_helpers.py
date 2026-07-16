"""Text processing helper functions."""


def word_count(text: str) -> int:
    """Count the number of whitespace-separated words in text.

    Args:
        text: The input text to count words from.

    Returns:
        The number of words, or 0 if text is empty or contains only whitespace.

    Examples:
        >>> word_count("hello world")
        2
        >>> word_count("hello")
        1
        >>> word_count("")
        0
        >>> word_count("   ")
        0
    """
    return len(text.split())
