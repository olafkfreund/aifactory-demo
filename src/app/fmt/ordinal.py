"""Ordinal formatting utilities."""


def ordinal(n: int) -> str:
    """
    Format an integer as an ordinal string.

    Args:
        n: An integer value (e.g., 1, 2, 3, etc.)

    Returns:
        Formatted ordinal string (e.g., '1st', '2nd', '3rd', '4th')

    Examples:
        >>> ordinal(1)
        '1st'
        >>> ordinal(2)
        '2nd'
        >>> ordinal(3)
        '3rd'
        >>> ordinal(4)
        '4th'
        >>> ordinal(11)
        '11th'
        >>> ordinal(21)
        '21st'
    """
    # Handle special cases for 11, 12, 13
    if abs(n) % 100 in (11, 12, 13):
        suffix = "th"
    else:
        # Look at the last digit
        last_digit = abs(n) % 10
        if last_digit == 1:
            suffix = "st"
        elif last_digit == 2:
            suffix = "nd"
        elif last_digit == 3:
            suffix = "rd"
        else:
            suffix = "th"

    return f"{n}{suffix}"
