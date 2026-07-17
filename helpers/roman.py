"""Roman numeral converter utility."""


def to_roman(n: int) -> str:
    """
    Convert an integer to uppercase Roman numerals.

    Args:
        n: An integer between 1 and 3999 (inclusive)

    Returns:
        The Roman numeral representation of n

    Raises:
        ValueError: If n is not in the range 1-3999

    Examples:
        >>> to_roman(1)
        'I'
        >>> to_roman(4)
        'IV'
        >>> to_roman(9)
        'IX'
        >>> to_roman(58)
        'LVIII'
        >>> to_roman(3999)
        'MMMCMXCIX'
    """
    if not isinstance(n, int) or isinstance(n, bool):
        raise ValueError("Input must be an integer")
    if n < 1 or n > 3999:
        raise ValueError("Input must be between 1 and 3999")

    # Mapping of values to Roman numerals in descending order
    # Include subtractive cases (4, 9, 40, 90, 400, 900)
    val_to_roman = [
        (1000, "M"),
        (900, "CM"),
        (500, "D"),
        (400, "CD"),
        (100, "C"),
        (90, "XC"),
        (50, "L"),
        (40, "XL"),
        (10, "X"),
        (9, "IX"),
        (5, "V"),
        (4, "IV"),
        (1, "I"),
    ]

    result = ""
    for value, numeral in val_to_roman:
        count = n // value
        result += numeral * count
        n -= value * count

    return result
