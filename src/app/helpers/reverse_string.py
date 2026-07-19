"""String manipulation helpers."""


def reverse_string(s: str) -> str:
    """
    Reverse a string.

    Args:
        s: The string to reverse.

    Returns:
        The reversed string. Handles empty strings and unicode characters correctly.

    Examples:
        >>> reverse_string('hello')
        'olleh'
        >>> reverse_string('')
        ''
        >>> reverse_string('a')
        'a'
    """
    return s[::-1]
