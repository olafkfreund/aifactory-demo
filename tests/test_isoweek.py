"""Tests for the iso_week_bounds helper function."""

import pytest
from datetime import date

from helpers.isoweek import iso_week_bounds


class TestIsoWeekBoundsBasic:
    """Test basic ISO week bounds calculation."""

    def test_monday_returns_itself(self):
        """Test that a Monday returns itself as the start of the week."""
        # 2024-01-15 is a Monday
        monday, sunday = iso_week_bounds(date(2024, 1, 15))
        assert monday == date(2024, 1, 15)
        assert sunday == date(2024, 1, 21)

    def test_sunday_returns_itself(self):
        """Test that a Sunday returns itself as the end of the week."""
        # 2024-01-21 is a Sunday
        monday, sunday = iso_week_bounds(date(2024, 1, 21))
        assert monday == date(2024, 1, 15)
        assert sunday == date(2024, 1, 21)

    def test_wednesday_middle_of_week(self):
        """Test a date in the middle of the week."""
        # 2024-01-17 is a Wednesday in week starting 2024-01-15
        monday, sunday = iso_week_bounds(date(2024, 1, 17))
        assert monday == date(2024, 1, 15)
        assert sunday == date(2024, 1, 21)

    def test_tuesday_start_of_week(self):
        """Test Tuesday (day 2 of ISO week)."""
        # 2024-01-16 is a Tuesday
        monday, sunday = iso_week_bounds(date(2024, 1, 16))
        assert monday == date(2024, 1, 15)
        assert sunday == date(2024, 1, 21)

    def test_friday_later_in_week(self):
        """Test Friday (day 5 of ISO week)."""
        # 2024-01-19 is a Friday
        monday, sunday = iso_week_bounds(date(2024, 1, 19))
        assert monday == date(2024, 1, 15)
        assert sunday == date(2024, 1, 21)


class TestIsoWeekBoundsYear2024:
    """Test ISO week calculations for the year 2024."""

    def test_week_1_2024(self):
        """Test week 1 of 2024 (2024-01-01)."""
        # 2024-01-01 is a Monday in ISO week 1
        monday, sunday = iso_week_bounds(date(2024, 1, 1))
        assert monday == date(2024, 1, 1)
        assert sunday == date(2024, 1, 7)

    def test_week_2_2024(self):
        """Test week 2 of 2024."""
        # 2024-01-08 is a Monday in ISO week 2
        monday, sunday = iso_week_bounds(date(2024, 1, 8))
        assert monday == date(2024, 1, 8)
        assert sunday == date(2024, 1, 14)

    def test_week_3_2024(self):
        """Test week 3 of 2024."""
        # 2024-01-15 is a Monday in ISO week 3
        monday, sunday = iso_week_bounds(date(2024, 1, 15))
        assert monday == date(2024, 1, 15)
        assert sunday == date(2024, 1, 21)

    def test_leap_day_2024(self):
        """Test leap day (Feb 29, 2024) which is a Thursday."""
        # 2024-02-29 is a Thursday in ISO week 9
        monday, sunday = iso_week_bounds(date(2024, 2, 29))
        assert monday == date(2024, 2, 26)
        assert sunday == date(2024, 3, 3)


class TestIsoWeekBoundsYearBoundaries:
    """Test ISO week calculations at year boundaries."""

    def test_december_31_spans_years(self):
        """Test December 31 which may be in ISO week of next year."""
        # 2023-12-31 is a Sunday, part of ISO week 52 of 2023
        monday, sunday = iso_week_bounds(date(2023, 12, 31))
        assert monday == date(2023, 12, 25)
        assert sunday == date(2023, 12, 31)

    def test_january_1_2024(self):
        """Test January 1, 2024 which is the start of ISO week 1."""
        # 2024-01-01 is a Monday
        monday, sunday = iso_week_bounds(date(2024, 1, 1))
        assert monday == date(2024, 1, 1)
        assert sunday == date(2024, 1, 7)

    def test_end_of_2024_into_2025(self):
        """Test dates near end of 2024."""
        # 2024-12-30 is a Monday in ISO week 1 of 2025
        monday, sunday = iso_week_bounds(date(2024, 12, 30))
        assert monday == date(2024, 12, 30)
        assert sunday == date(2025, 1, 5)

    def test_late_december_2024(self):
        """Test late December 2024."""
        # 2024-12-25 is a Wednesday in ISO week 52 of 2024
        monday, sunday = iso_week_bounds(date(2024, 12, 25))
        assert monday == date(2024, 12, 23)
        assert sunday == date(2024, 12, 29)


class TestIsoWeekBoundsReturnTypes:
    """Test that return values are correct type and structure."""

    def test_returns_tuple(self):
        """Test that result is a tuple."""
        result = iso_week_bounds(date(2024, 1, 15))
        assert isinstance(result, tuple)

    def test_returns_tuple_of_two_dates(self):
        """Test that result is a tuple of two date objects."""
        monday, sunday = iso_week_bounds(date(2024, 1, 15))
        assert isinstance(monday, date)
        assert isinstance(sunday, date)

    def test_monday_before_sunday(self):
        """Test that Monday comes before Sunday."""
        monday, sunday = iso_week_bounds(date(2024, 1, 15))
        assert monday < sunday

    def test_sunday_is_six_days_after_monday(self):
        """Test that Sunday is exactly 6 days after Monday."""
        monday, sunday = iso_week_bounds(date(2024, 1, 15))
        delta = sunday - monday
        assert delta.days == 6


class TestIsoWeekBoundsEdgeCases:
    """Test edge cases and special dates."""

    def test_first_day_of_year_2024(self):
        """Test January 1, 2024."""
        monday, sunday = iso_week_bounds(date(2024, 1, 1))
        assert monday == date(2024, 1, 1)
        assert sunday == date(2024, 1, 7)

    def test_last_day_of_year_2024(self):
        """Test December 31, 2024."""
        # 2024-12-31 is a Tuesday in ISO week 1 of 2025
        monday, sunday = iso_week_bounds(date(2024, 12, 31))
        assert monday == date(2024, 12, 30)
        assert sunday == date(2025, 1, 5)

    def test_january_1_2023(self):
        """Test January 1, 2023 (a Sunday)."""
        # 2023-01-01 is a Sunday in ISO week 52 of 2022
        monday, sunday = iso_week_bounds(date(2023, 1, 1))
        assert monday == date(2022, 12, 26)
        assert sunday == date(2023, 1, 1)

    def test_february_29_non_leap_year_behavior(self):
        """Test behavior with dates around leap day."""
        # 2024 is a leap year, Feb 29 exists
        # 2023 is not a leap year
        thursday = iso_week_bounds(date(2024, 2, 29))
        assert thursday[0] == date(2024, 2, 26)  # Monday
        assert thursday[1] == date(2024, 3, 3)   # Sunday

    def test_consistent_across_different_years(self):
        """Test that same day of week in different years works correctly."""
        # Both are Mondays
        monday_2024, sunday_2024 = iso_week_bounds(date(2024, 1, 1))
        monday_2023, sunday_2023 = iso_week_bounds(date(2023, 1, 2))

        # Both should start on Monday
        assert monday_2024.weekday() == 0  # Monday
        assert monday_2023.weekday() == 0  # Monday


class TestIsoWeekBoundsRealWorld:
    """Test real-world use cases."""

    def test_business_week_calculation(self):
        """Test calculation for business reporting."""
        # Monday to Friday of week
        monday, sunday = iso_week_bounds(date(2024, 7, 17))
        assert monday.weekday() == 0  # Monday
        assert sunday.weekday() == 6  # Sunday

    def test_sprint_planning_monday(self):
        """Test sprint planning on a Monday."""
        monday, sunday = iso_week_bounds(date(2024, 1, 22))
        assert monday == date(2024, 1, 22)
        assert sunday == date(2024, 1, 28)

    def test_sprint_planning_friday(self):
        """Test sprint planning on a Friday."""
        monday, sunday = iso_week_bounds(date(2024, 1, 26))
        assert monday == date(2024, 1, 22)
        assert sunday == date(2024, 1, 28)

    def test_weekly_report_date(self):
        """Test getting week bounds for a weekly report."""
        # Report date could be any day of the week
        report_date = date(2024, 3, 15)  # A Friday
        monday, sunday = iso_week_bounds(report_date)
        assert monday == date(2024, 3, 11)
        assert sunday == date(2024, 3, 17)
