"""word_reverse: Reverse characters of each whitespace-separated word."""


def word_reverse(text: str) -> str:
    """
    Reverse the characters of each whitespace-separated word, keeping word order.

    Args:
        text: Input text string

    Returns:
        String with each word's characters reversed, words in original order

    Examples:
        >>> word_reverse("abc def")
        'cba fed'
        >>> word_reverse("hello")
        'olleh'
        >>> word_reverse("")
        ''
    """
    if not text:
        return ""

    words = text.split()
    reversed_words = [word[::-1] for word in words]
    return " ".join(reversed_words)
