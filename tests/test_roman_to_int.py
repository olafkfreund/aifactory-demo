"""Comprehensive unit tests for roman_to_int helper function."""

import pytest
from app.helpers import roman_to_int


class TestBasicNumerals:
    """Test single Roman numeral characters."""

    def test_single_I(self):
        """Test single I = 1."""
        assert roman_to_int("I") == 1

    def test_single_V(self):
        """Test single V = 5."""
        assert roman_to_int("V") == 5

    def test_single_X(self):
        """Test single X = 10."""
        assert roman_to_int("X") == 10

    def test_single_L(self):
        """Test single L = 50."""
        assert roman_to_int("L") == 50

    def test_single_C(self):
        """Test single C = 100."""
        assert roman_to_int("C") == 100

    def test_single_D(self):
        """Test single D = 500."""
        assert roman_to_int("D") == 500

    def test_single_M(self):
        """Test single M = 1000."""
        assert roman_to_int("M") == 1000


class TestAddition:
    """Test addition of consecutive numerals."""

    def test_multiple_I(self):
        """Test III = 3."""
        assert roman_to_int("III") == 3

    def test_multiple_II(self):
        """Test II = 2."""
        assert roman_to_int("II") == 2

    def test_V_plus_I(self):
        """Test VI = 6."""
        assert roman_to_int("VI") == 6

    def test_V_plus_II(self):
        """Test VII = 7."""
        assert roman_to_int("VII") == 7

    def test_V_plus_III(self):
        """Test VIII = 8."""
        assert roman_to_int("VIII") == 8

    def test_X_plus_V(self):
        """Test XV = 15."""
        assert roman_to_int("XV") == 15

    def test_XX(self):
        """Test XX = 20."""
        assert roman_to_int("XX") == 20

    def test_XXX(self):
        """Test XXX = 30."""
        assert roman_to_int("XXX") == 30

    def test_L_plus_X(self):
        """Test LX = 60."""
        assert roman_to_int("LX") == 60

    def test_L_plus_XXX(self):
        """Test LXXX = 80."""
        assert roman_to_int("LXXX") == 80

    def test_C_plus_L(self):
        """Test CL = 150."""
        assert roman_to_int("CL") == 150

    def test_multiple_hundreds(self):
        """Test CC = 200."""
        assert roman_to_int("CC") == 200

    def test_M_plus_C(self):
        """Test MC = 1100."""
        assert roman_to_int("MC") == 1100


class TestSubtractiveNotation:
    """Test subtractive notation pairs."""

    def test_IV_subtractive(self):
        """Test IV = 4."""
        assert roman_to_int("IV") == 4

    def test_IX_subtractive(self):
        """Test IX = 9."""
        assert roman_to_int("IX") == 9

    def test_XL_subtractive(self):
        """Test XL = 40."""
        assert roman_to_int("XL") == 40

    def test_XC_subtractive(self):
        """Test XC = 90."""
        assert roman_to_int("XC") == 90

    def test_CD_subtractive(self):
        """Test CD = 400."""
        assert roman_to_int("CD") == 400

    def test_CM_subtractive(self):
        """Test CM = 900."""
        assert roman_to_int("CM") == 900


class TestSpecExamples:
    """Test the examples from the acceptance criteria."""

    def test_spec_example_III(self):
        """Test roman_to_int("III") == 3."""
        assert roman_to_int("III") == 3

    def test_spec_example_LVIII(self):
        """Test roman_to_int("LVIII") == 58."""
        assert roman_to_int("LVIII") == 58

    def test_spec_example_MCMXCIV(self):
        """Test roman_to_int("MCMXCIV") == 1994."""
        assert roman_to_int("MCMXCIV") == 1994


class TestComplexCombinations:
    """Test complex combinations with multiple subtractive notations."""

    def test_IV_followed_by_V(self):
        """Test IV followed by other numerals."""
        assert roman_to_int("IVV") == 9  # IV (4) + V (5)

    def test_multiple_subtractive(self):
        """Test XL + IV = 44."""
        assert roman_to_int("XLIV") == 44

    def test_CD_plus_XL(self):
        """Test CD + XL + IV = 444."""
        assert roman_to_int("CDXLIV") == 444

    def test_CM_plus_XC_plus_IX(self):
        """Test CM + XC + IX = 999."""
        assert roman_to_int("CMXCIX") == 999

    def test_M_plus_CM_plus_XC_plus_IX(self):
        """Test full complex numeral 1999."""
        assert roman_to_int("MCMXCIX") == 1999

    def test_MMM_plus_combinations(self):
        """Test MMMCDXLIV = 3444."""
        assert roman_to_int("MMMCDXLIV") == 3444

    def test_large_number(self):
        """Test MMMCMXCIX = 3999."""
        assert roman_to_int("MMMCMXCIX") == 3999


class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_single_character(self):
        """Test that single characters work."""
        assert roman_to_int("M") == 1000

    def test_repeated_numerals(self):
        """Test repeated numerals (up to 3 in a row is valid)."""
        assert roman_to_int("MMM") == 3000

    def test_all_additive(self):
        """Test purely additive numeral."""
        assert roman_to_int("MDCLXVI") == 1666

    def test_mixed_additive_and_subtractive(self):
        """Test mixed additive and subtractive."""
        assert roman_to_int("MDCLXIV") == 1664

    def test_empty_after_subtraction(self):
        """Test that we can have subtractive at the end."""
        assert roman_to_int("IX") == 9
        assert roman_to_int("XL") == 40
        assert roman_to_int("CD") == 400

    def test_subtractive_start_to_end(self):
        """Test numerals that start and end with subtractive."""
        assert roman_to_int("XCIX") == 99


class TestCommonNumbers:
    """Test common numbers to verify correctness."""

    def test_year_1994(self):
        """Test the year 1994: MCMXCIV."""
        assert roman_to_int("MCMXCIV") == 1994

    def test_year_2000(self):
        """Test the year 2000: MM."""
        assert roman_to_int("MM") == 2000

    def test_year_1984(self):
        """Test the year 1984: MCMLXXXIV."""
        assert roman_to_int("MCMLXXXIV") == 1984

    def test_12(self):
        """Test XII = 12."""
        assert roman_to_int("XII") == 12

    def test_27(self):
        """Test XXVII = 27."""
        assert roman_to_int("XXVII") == 27

    def test_49(self):
        """Test XLIX = 49."""
        assert roman_to_int("XLIX") == 49

    def test_58(self):
        """Test LVIII = 58."""
        assert roman_to_int("LVIII") == 58

    def test_1994(self):
        """Test MCMXCIV = 1994."""
        assert roman_to_int("MCMXCIV") == 1994


class TestSystematicValueCoverage:
    """Systematically test various values to ensure thorough coverage."""

    def test_1_to_10(self):
        """Test numerals from 1 to 10."""
        assert roman_to_int("I") == 1
        assert roman_to_int("II") == 2
        assert roman_to_int("III") == 3
        assert roman_to_int("IV") == 4
        assert roman_to_int("V") == 5
        assert roman_to_int("VI") == 6
        assert roman_to_int("VII") == 7
        assert roman_to_int("VIII") == 8
        assert roman_to_int("IX") == 9
        assert roman_to_int("X") == 10

    def test_10_to_20(self):
        """Test numerals from 10 to 20."""
        assert roman_to_int("X") == 10
        assert roman_to_int("XI") == 11
        assert roman_to_int("XII") == 12
        assert roman_to_int("XIII") == 13
        assert roman_to_int("XIV") == 14
        assert roman_to_int("XV") == 15
        assert roman_to_int("XVI") == 16
        assert roman_to_int("XVII") == 17
        assert roman_to_int("XVIII") == 18
        assert roman_to_int("XIX") == 19
        assert roman_to_int("XX") == 20

    def test_tens(self):
        """Test tens (10, 20, 30, ..., 100)."""
        assert roman_to_int("X") == 10
        assert roman_to_int("XX") == 20
        assert roman_to_int("XXX") == 30
        assert roman_to_int("XL") == 40
        assert roman_to_int("L") == 50
        assert roman_to_int("LX") == 60
        assert roman_to_int("LXX") == 70
        assert roman_to_int("LXXX") == 80
        assert roman_to_int("XC") == 90
        assert roman_to_int("C") == 100

    def test_hundreds(self):
        """Test hundreds."""
        assert roman_to_int("C") == 100
        assert roman_to_int("CC") == 200
        assert roman_to_int("CCC") == 300
        assert roman_to_int("CD") == 400
        assert roman_to_int("D") == 500
        assert roman_to_int("DC") == 600
        assert roman_to_int("DCC") == 700
        assert roman_to_int("DCCC") == 800
        assert roman_to_int("CM") == 900

    def test_thousands(self):
        """Test thousands."""
        assert roman_to_int("M") == 1000
        assert roman_to_int("MM") == 2000
        assert roman_to_int("MMM") == 3000
