"""Titlecase function for capitalizing the first letter of each word."""


def titlecase(text: str) -> str:
    """
    Capitalize the first letter of each whitespace-separated word.

    Splits the input text by whitespace, capitalizes the first letter of each
    word (leaving the rest as-is), and rejoins with the original spacing.

    Args:
        text: The text to titlecase.

    Returns:
        The titlecased text, or empty string if input is empty.

    Examples:
        >>> titlecase("hello world")
        'Hello World'
        >>> titlecase("hello WORLD")
        'Hello WORLD'
        >>> titlecase("a")
        'A'
        >>> titlecase("")
        ''
    """
    if not text:
        return ""

    words = text.split()
    titlecased_words = []

    for word in words:
        if word:
            titlecased_words.append(word[0].upper() + word[1:])
        else:
            titlecased_words.append(word)

    return " ".join(titlecased_words)
