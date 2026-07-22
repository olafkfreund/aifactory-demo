"""String reversal helper functions."""


def reverse_string(s: str) -> str:
    """
    Reverse a string.

    Takes a string and returns it reversed. Handles empty strings and unicode
    characters correctly.

    Args:
        s: The string to reverse.

    Returns:
        The reversed string.

    Examples:
        >>> reverse_string('')
        ''
        >>> reverse_string('a')
        'a'
        >>> reverse_string('abc')
        'cba'
        >>> reverse_string('hello')
        'olleh'
    """
    return s[::-1]
