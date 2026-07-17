"""Tests for the ordinal formatter."""

import pytest

from src.app.fmt.ordinal import ordinal


class TestOrdinalFormatter:
    """Test suite for the ordinal formatter."""

    def test_one(self):
        """Test formatting 1."""
        assert ordinal(1) == "1st"

    def test_two(self):
        """Test formatting 2."""
        assert ordinal(2) == "2nd"

    def test_three(self):
        """Test formatting 3."""
        assert ordinal(3) == "3rd"

    def test_four(self):
        """Test formatting 4."""
        assert ordinal(4) == "4th"

    def test_five_through_ten(self):
        """Test formatting 5-10 all end with 'th'."""
        assert ordinal(5) == "5th"
        assert ordinal(6) == "6th"
        assert ordinal(7) == "7th"
        assert ordinal(8) == "8th"
        assert ordinal(9) == "9th"
        assert ordinal(10) == "10th"

    def test_eleven(self):
        """Test formatting 11 (special case, ends with 'th')."""
        assert ordinal(11) == "11th"

    def test_twelve(self):
        """Test formatting 12 (special case, ends with 'th')."""
        assert ordinal(12) == "12th"

    def test_thirteen(self):
        """Test formatting 13 (special case, ends with 'th')."""
        assert ordinal(13) == "13th"

    def test_fourteen_through_twenty(self):
        """Test formatting 14-20 all end with 'th'."""
        assert ordinal(14) == "14th"
        assert ordinal(15) == "15th"
        assert ordinal(16) == "16th"
        assert ordinal(17) == "17th"
        assert ordinal(18) == "18th"
        assert ordinal(19) == "19th"
        assert ordinal(20) == "20th"

    def test_twenty_one(self):
        """Test formatting 21 (ends with 'st')."""
        assert ordinal(21) == "21st"

    def test_twenty_two(self):
        """Test formatting 22 (ends with 'nd')."""
        assert ordinal(22) == "22nd"

    def test_twenty_three(self):
        """Test formatting 23 (ends with 'rd')."""
        assert ordinal(23) == "23rd"

    def test_twenty_four(self):
        """Test formatting 24 (ends with 'th')."""
        assert ordinal(24) == "24th"

    def test_large_numbers(self):
        """Test formatting large numbers."""
        assert ordinal(100) == "100th"
        assert ordinal(101) == "101st"
        assert ordinal(102) == "102nd"
        assert ordinal(103) == "103rd"
        assert ordinal(111) == "111th"
        assert ordinal(112) == "112th"
        assert ordinal(113) == "113th"
        assert ordinal(121) == "121st"
        assert ordinal(999) == "999th"
        assert ordinal(1000) == "1000th"
        assert ordinal(1001) == "1001st"
        assert ordinal(1234) == "1234th"

    def test_negative_one(self):
        """Test formatting -1."""
        assert ordinal(-1) == "-1st"

    def test_negative_two(self):
        """Test formatting -2."""
        assert ordinal(-2) == "-2nd"

    def test_negative_three(self):
        """Test formatting -3."""
        assert ordinal(-3) == "-3rd"

    def test_negative_four(self):
        """Test formatting -4."""
        assert ordinal(-4) == "-4th"

    def test_negative_eleven(self):
        """Test formatting -11 (special case)."""
        assert ordinal(-11) == "-11th"

    def test_negative_twelve(self):
        """Test formatting -12 (special case)."""
        assert ordinal(-12) == "-12th"

    def test_negative_thirteen(self):
        """Test formatting -13 (special case)."""
        assert ordinal(-13) == "-13th"

    def test_negative_twenty_one(self):
        """Test formatting -21."""
        assert ordinal(-21) == "-21st"

    def test_negative_large_numbers(self):
        """Test formatting negative large numbers."""
        assert ordinal(-100) == "-100th"
        assert ordinal(-101) == "-101st"
        assert ordinal(-111) == "-111th"
        assert ordinal(-121) == "-121st"

    def test_zero(self):
        """Test formatting 0."""
        assert ordinal(0) == "0th"

    def test_pattern_tens_ending_in_1(self):
        """Test all tens ending in 1 use 'st'."""
        for n in [1, 21, 31, 41, 51, 61, 71, 81, 91, 101, 121, 201]:
            assert ordinal(n).endswith("st"), f"{n} should end with 'st'"

    def test_pattern_tens_ending_in_2(self):
        """Test all tens ending in 2 use 'nd'."""
        for n in [2, 22, 32, 42, 52, 62, 72, 82, 92, 102, 122, 202]:
            assert ordinal(n).endswith("nd"), f"{n} should end with 'nd'"

    def test_pattern_tens_ending_in_3(self):
        """Test all tens ending in 3 use 'rd'."""
        for n in [3, 23, 33, 43, 53, 63, 73, 83, 93, 103, 123, 203]:
            assert ordinal(n).endswith("rd"), f"{n} should end with 'rd'"

    def test_pattern_11_12_13_use_th(self):
        """Test that 11, 12, 13 (and variants like 111, 211) use 'th'."""
        for n in [11, 12, 13, 111, 112, 113, 211, 212, 213]:
            assert ordinal(n).endswith("th"), f"{n} should end with 'th'"

    def test_output_format_includes_number(self):
        """Test that output includes the number."""
        for n in [1, 5, 10, 21, 100, -5, -21]:
            result = ordinal(n)
            assert str(abs(n)) in result, f"Result '{result}' should contain '{abs(n)}'"

    def test_output_always_has_suffix(self):
        """Test that all outputs end with a valid ordinal suffix."""
        valid_suffixes = ("st", "nd", "rd", "th")
        for n in [0, 1, 2, 3, 4, 5, 11, 12, 13, 21, 22, 23, 100, 111, -1, -11]:
            result = ordinal(n)
            assert result.endswith(valid_suffixes), f"Result '{result}' should end with a valid suffix"
