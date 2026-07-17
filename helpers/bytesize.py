"""Convert byte counts to human-readable format."""


def human_bytes(n: int | float) -> str:
    """
    Convert byte count to a human-readable format.

    Renders byte counts as B, KB, MB, or GB with appropriate precision.
    Values KB and above are shown with one decimal place.

    Args:
        n: Byte count (integer or float).

    Returns:
        Human-readable byte size string.

    Example:
        >>> human_bytes(512)
        '512B'
        >>> human_bytes(1024)
        '1.0KB'
        >>> human_bytes(1048576)
        '1.0MB'
        >>> human_bytes(1073741824)
        '1.0GB'
    """
    if n < 1024:
        return f"{int(n)}B"

    # Kilobytes
    kb = n / 1024
    if kb < 1024:
        return f"{kb:.1f}KB"

    # Megabytes
    mb = kb / 1024
    if mb < 1024:
        return f"{mb:.1f}MB"

    # Gigabytes
    gb = mb / 1024
    return f"{gb:.1f}GB"
