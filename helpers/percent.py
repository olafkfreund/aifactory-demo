"""Percentage formatting utilities."""


def format_percent(x: float, digits: int = 1) -> str:
    """Format a decimal number as a percentage string.

    Args:
        x: A decimal number (e.g., 0.5 for 50%)
        digits: Number of decimal places in the output (default: 1)

    Returns:
        A formatted percentage string (e.g., "50.0%")
    """
    percent_value = x * 100
    format_string = f"{{:.{digits}f}}%"
    return format_string.format(percent_value)
