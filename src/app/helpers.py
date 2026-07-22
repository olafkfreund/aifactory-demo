"""Helper functions for aifactory-demo."""


def roman_to_int(s: str) -> int:
    """
    Convert a Roman numeral string to its integer value.

    Handles standard Roman numeral notation including subtractive cases:
    - IV (4), IX (9), XL (40), XC (90), CD (400), CM (900)

    Args:
        s: A valid Roman numeral string (uppercase, using I, V, X, L, C, D, M).

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
    # Map Roman numeral characters to their integer values
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
    prev_value = 0

    # Iterate through the string in reverse order
    for char in reversed(s):
        value = roman_values[char]

        # If current value is less than previous, it's a subtractive case (e.g., IV)
        if value < prev_value:
            total -= value
        else:
            total += value

        prev_value = value

    return total
