"""Percent formatting utilities."""


def percent(x: float) -> str:
    """
    Format a decimal as a percentage string.

    Args:
        x: Decimal value (e.g., 0.123 for 12.3%)

    Returns:
        Formatted percentage string (e.g., '12.3%')

    Examples:
        >>> percent(0)
        '0.0%'
        >>> percent(0.123)
        '12.3%'
        >>> percent(1)
        '100.0%'
        >>> percent(-0.05)
        '-5.0%'
    """
    # Convert decimal to percentage
    percentage_value = x * 100

    # Handle negative zero
    if percentage_value == 0:
        percentage_value = 0.0

    # Format with one decimal place
    return f"{percentage_value:.1f}%"
