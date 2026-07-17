"""Number compacting utility for formatting large numbers into readable short strings."""


def compact(n: int | float) -> str:
    """
    Convert a number to a compact string representation.

    Formats large numbers using SI suffixes (k, M, B, T).
    Examples:
        1000 -> "1k"
        1500 -> "1.5k"
        1000000 -> "1M"
        1500000 -> "1.5M"
        1000000000 -> "1B"
        1000000000000 -> "1T"

    Args:
        n: A number to compact (int or float)

    Returns:
        A string representation of the number in compact form.
        Numbers less than 1000 are returned as-is (as strings).
    """
    # Handle numbers less than 1000
    if abs(n) < 1000:
        return str(int(n)) if isinstance(n, float) and n.is_integer() else str(n)

    # Define the suffixes and their thresholds
    suffixes = [
        (1_000_000_000_000, "T"),
        (1_000_000_000, "B"),
        (1_000_000, "M"),
        (1_000, "k"),
    ]

    for threshold, suffix in suffixes:
        if abs(n) >= threshold:
            # Divide by the threshold to get the compact number
            compact_num = n / threshold

            # Format with one decimal place, then remove trailing zeros
            formatted = f"{compact_num:.1f}".rstrip("0").rstrip(".")

            return f"{formatted}{suffix}"

    # Fallback (shouldn't reach here given the initial check)
    return str(int(n)) if isinstance(n, float) and n.is_integer() else str(n)
