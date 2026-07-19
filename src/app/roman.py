"""Pure function to convert Roman numerals to integers."""


def roman_to_int(s: str) -> int:
    """
    Convert a Roman numeral string to its integer value.

    Handles uppercase Roman numeral characters (I, V, X, L, C, D, M) and
    subtractive notation (e.g., IV=4, IX=9, XL=40, XC=90, CD=400, CM=900).

    Args:
        s: A valid Roman numeral string in uppercase.

    Returns:
        The integer value of the Roman numeral.

    Examples:
        >>> roman_to_int("III")
        3
        >>> roman_to_int("IV")
        4
        >>> roman_to_int("LVIII")
        58
        >>> roman_to_int("MCMXCIV")
        1994
    """
    # Map each Roman character to its integer value
    values = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}

    total = 0
    prev_value = 0

    # Process characters from right to left
    for char in reversed(s):
        current_value = values[char]

        # If current value is less than previous, it's subtractive notation
        if current_value < prev_value:
            total -= current_value
        else:
            total += current_value

        prev_value = current_value

    return total
