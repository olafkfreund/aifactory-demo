"""Pure string reversal helper function."""


def reverse_string(s: str) -> str:
    """Reverse a string.

    This pure function reverses the input string and returns the result.
    It correctly handles empty strings, single characters, unicode characters,
    and multi-byte character sequences.

    Args:
        s: The input string to reverse.

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
        >>> reverse_string('hello world!')
        '!dlrow olleh'
        >>> reverse_string('😀🎉')
        '🎉😀'
    """
    return s[::-1]
