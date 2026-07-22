"""Helper functions for the aifactory-demo application."""


def roman_to_int(s: str) -> int:
    """Convert a Roman numeral string to an integer.

    Handles standard Roman numerals (I, V, X, L, C, D, M) and subtractive notation
    (IV, IX, XL, XC, CD, CM).

    Args:
        s: A string containing a valid Roman numeral in uppercase.

    Returns:
        The integer value of the Roman numeral.

    Examples:
        >>> roman_to_int("III")
        3
        >>> roman_to_int("LVIII")
        58
        >>> roman_to_int("MCMXCIV")
        1994
    """
    # Mapping of Roman numerals to their values
    roman_values = {
        "I": 1,
        "V": 5,
        "X": 10,
        "L": 50,
        "C": 100,
        "D": 500,
        "M": 1000,
    }

    total = 0
    i = 0

    while i < len(s):
        # Check for subtractive notation (current value is less than next value)
        if i + 1 < len(s) and roman_values[s[i]] < roman_values[s[i + 1]]:
            # Subtractive case: subtract current from next
            total += roman_values[s[i + 1]] - roman_values[s[i]]
            i += 2
        else:
            # Regular case: add current value
            total += roman_values[s[i]]
            i += 1

    return total
