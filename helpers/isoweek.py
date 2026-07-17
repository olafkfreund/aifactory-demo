"""Calculate ISO week bounds (Monday and Sunday of an ISO week)."""

from datetime import date, timedelta


def iso_week_bounds(d: date) -> tuple[date, date]:
    """
    Return the Monday and Sunday of the ISO week containing the given date.

    The ISO week starts on Monday and ends on Sunday. This function returns
    the first and last day of the ISO week for any given date.

    Args:
        d: A datetime.date object.

    Returns:
        A tuple of (Monday, Sunday) representing the ISO week bounds.

    Example:
        >>> iso_week_bounds(date(2024, 1, 15))  # A Monday in week 3
        (datetime.date(2024, 1, 15), datetime.date(2024, 1, 21))
        >>> iso_week_bounds(date(2024, 1, 17))  # A Wednesday
        (datetime.date(2024, 1, 15), datetime.date(2024, 1, 21))
    """
    # Get the ISO calendar (year, week, weekday)
    # Weekday: 1=Monday, 7=Sunday
    iso_year, iso_week, iso_weekday = d.isocalendar()

    # Calculate how many days to go back to get to Monday
    days_to_monday = iso_weekday - 1

    # Get Monday of this ISO week
    monday = d - timedelta(days=days_to_monday)

    # Sunday is 6 days after Monday
    sunday = monday + timedelta(days=6)

    return (monday, sunday)
