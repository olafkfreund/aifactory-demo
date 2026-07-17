"""vowel_count: Count vowels in text."""


def vowel_count(text: str) -> int:
    """
    Count vowels in text (case-insensitive).

    Vowels are: a, e, i, o, u (case-insensitive).

    Args:
        text: Input text string

    Returns:
        Number of vowels in text

    Examples:
        >>> vowel_count("hello")
        2
        >>> vowel_count("aeiou")
        5
        >>> vowel_count("")
        0
    """
    if not text:
        return 0

    vowels = "aeiouAEIOU"
    return sum(1 for char in text if char in vowels)
