"""Titlecase function for capitalizing the first letter of each word."""

import re


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
        >>> titlecase("hello  world")
        'Hello  World'
        >>> titlecase("hello\tworld")
        'Hello\tWorld'
    """
    if not text:
        return ""

    # Use regex to capitalize the first letter of each whitespace-separated word
    # Split by whitespace while keeping the whitespace, then capitalize first letter in each chunk
    def process_word(match):
        whitespace = match.group(1)  # The preceding whitespace or start-of-string marker
        word = match.group(2)  # The non-whitespace word content

        if not word:
            return whitespace

        # Find the first letter in the word and capitalize it
        for i, char in enumerate(word):
            if char.isalpha():
                return whitespace + word[:i] + char.upper() + word[i+1:]

        # If no letters found, return the word as-is
        return whitespace + word

    # Match: (start of string or whitespace) + (non-whitespace sequence)
    result = re.sub(r'(^|\s)([^\s]*)', process_word, text)
    return result
