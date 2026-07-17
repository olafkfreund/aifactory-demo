"""Money formatting utilities."""


def money(cents: int) -> str:
    """
    Format cents as a dollar string.

    Args:
        cents: Amount in cents (e.g., 1234 for $12.34)

    Returns:
        Formatted dollar string (e.g., '$12.34')

    Examples:
        >>> money(0)
        '$0.00'
        >>> money(1234)
        '$12.34'
        >>> money(-50)
        '-$0.50'
    """
    is_negative = cents < 0
    abs_cents = abs(cents)
    dollars = abs_cents // 100
    remaining_cents = abs_cents % 100

    if is_negative:
        return f"-${dollars}.{remaining_cents:02d}"
    else:
        return f"${dollars}.{remaining_cents:02d}"
