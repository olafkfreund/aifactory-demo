def thousands(n: int | float) -> str:
    """Format a number with thousand separators.

    Args:
        n: A number to format

    Returns:
        A string representation of the number with comma separators

    Examples:
        >>> thousands(1000)
        '1,000'
        >>> thousands(1234567)
        '1,234,567'
        >>> thousands(42)
        '42'
    """
    return f"{int(n):,}"
