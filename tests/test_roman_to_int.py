"""Unit tests for roman_to_int helper function."""

from src.app.roman import roman_to_int


class TestBasicNumerals:
    """Test basic Roman numeral characters."""

    def test_single_i(self):
        assert roman_to_int("I") == 1

    def test_single_v(self):
        assert roman_to_int("V") == 5

    def test_single_x(self):
        assert roman_to_int("X") == 10

    def test_single_l(self):
        assert roman_to_int("L") == 50

    def test_single_c(self):
        assert roman_to_int("C") == 100

    def test_single_d(self):
        assert roman_to_int("D") == 500

    def test_single_m(self):
        assert roman_to_int("M") == 1000


class TestAddition:
    """Test addition of Roman numerals (same/larger values)."""

    def test_repeated_i(self):
        assert roman_to_int("III") == 3

    def test_repeated_x(self):
        assert roman_to_int("XXX") == 30

    def test_repeated_c(self):
        assert roman_to_int("CCC") == 300

    def test_repeated_m(self):
        assert roman_to_int("MMM") == 3000

    def test_vi(self):
        assert roman_to_int("VI") == 6

    def test_xi(self):
        assert roman_to_int("XI") == 11

    def test_lx(self):
        assert roman_to_int("LX") == 60


class TestSubtractiveNotation:
    """Test subtractive notation (smaller before larger)."""

    def test_iv(self):
        assert roman_to_int("IV") == 4

    def test_ix(self):
        assert roman_to_int("IX") == 9

    def test_xl(self):
        assert roman_to_int("XL") == 40

    def test_xc(self):
        assert roman_to_int("XC") == 90

    def test_cd(self):
        assert roman_to_int("CD") == 400

    def test_cm(self):
        assert roman_to_int("CM") == 900


class TestSpecExamples:
    """Test examples from the specification."""

    def test_spec_example_1(self):
        """Example: III = 3"""
        assert roman_to_int("III") == 3

    def test_spec_example_2(self):
        """Example: LVIII = 58"""
        assert roman_to_int("LVIII") == 58

    def test_spec_example_3(self):
        """Example: MCMXCIV = 1994"""
        assert roman_to_int("MCMXCIV") == 1994


class TestComplexNumbers:
    """Test complex combinations of numerals."""

    def test_xliv(self):
        """XL (40) + IV (4) = 44"""
        assert roman_to_int("XLIV") == 44

    def test_xcix(self):
        """XC (90) + IX (9) = 99"""
        assert roman_to_int("XCIX") == 99

    def test_cdxl(self):
        """CD (400) + XL (40) = 440"""
        assert roman_to_int("CDXL") == 440

    def test_cmxc(self):
        """CM (900) + XC (90) = 990"""
        assert roman_to_int("CMXC") == 990

    def test_mcmxliv(self):
        """M (1000) + CM (900) + XL (40) + IV (4) = 1944"""
        assert roman_to_int("MCMXLIV") == 1944

    def test_mmmcmxcix(self):
        """MMM (3000) + CM (900) + XC (90) + IX (9) = 3999"""
        assert roman_to_int("MMMCMXCIX") == 3999
