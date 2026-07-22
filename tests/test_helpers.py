import pytest

from app.helpers import roman_to_int


# Test the three main examples from spec
def test_roman_to_int_three():
    assert roman_to_int("III") == 3


def test_roman_to_int_fifty_eight():
    assert roman_to_int("LVIII") == 58


def test_roman_to_int_nineteen_ninety_four():
    assert roman_to_int("MCMXCIV") == 1994


# Test single character values
def test_roman_to_int_single_i():
    assert roman_to_int("I") == 1


def test_roman_to_int_single_v():
    assert roman_to_int("V") == 5


def test_roman_to_int_single_x():
    assert roman_to_int("X") == 10


def test_roman_to_int_single_l():
    assert roman_to_int("L") == 50


def test_roman_to_int_single_c():
    assert roman_to_int("C") == 100


def test_roman_to_int_single_d():
    assert roman_to_int("D") == 500


def test_roman_to_int_single_m():
    assert roman_to_int("M") == 1000


# Test all six subtractive pairs
def test_roman_to_int_iv_subtractive():
    assert roman_to_int("IV") == 4


def test_roman_to_int_ix_subtractive():
    assert roman_to_int("IX") == 9


def test_roman_to_int_xl_subtractive():
    assert roman_to_int("XL") == 40


def test_roman_to_int_xc_subtractive():
    assert roman_to_int("XC") == 90


def test_roman_to_int_cd_subtractive():
    assert roman_to_int("CD") == 400


def test_roman_to_int_cm_subtractive():
    assert roman_to_int("CM") == 900


# Test sequences of the same character
def test_roman_to_int_i_repeated():
    assert roman_to_int("I") == 1
    assert roman_to_int("II") == 2
    assert roman_to_int("III") == 3


def test_roman_to_int_x_repeated():
    assert roman_to_int("X") == 10
    assert roman_to_int("XX") == 20
    assert roman_to_int("XXX") == 30


def test_roman_to_int_c_repeated():
    assert roman_to_int("C") == 100
    assert roman_to_int("CC") == 200
    assert roman_to_int("CCC") == 300


def test_roman_to_int_m_repeated():
    assert roman_to_int("M") == 1000
    assert roman_to_int("MM") == 2000
    assert roman_to_int("MMM") == 3000


# Test longer sequences with mixed values
def test_roman_to_int_mixed_sequences():
    assert roman_to_int("VI") == 6
    assert roman_to_int("XI") == 11
    assert roman_to_int("XV") == 15
    assert roman_to_int("XX") == 20
    assert roman_to_int("XXI") == 21
    assert roman_to_int("XXVI") == 26


def test_roman_to_int_longer_sequences():
    assert roman_to_int("XLII") == 42
    assert roman_to_int("XCIX") == 99
    assert roman_to_int("CCCLXIX") == 369
    assert roman_to_int("MMMCMXCIX") == 3999


# Test combinations with subtractive pairs
def test_roman_to_int_with_subtractive_pairs():
    assert roman_to_int("IVI") == 5  # IV (4) + I (1)
    assert roman_to_int("XLVI") == 46  # XL (40) + VI (6)
    assert roman_to_int("XCIX") == 99  # XC (90) + IX (9)
    assert roman_to_int("CDXL") == 440  # CD (400) + XL (40)
    assert roman_to_int("CMXC") == 990  # CM (900) + XC (90)


# Test additional edge cases
def test_roman_to_int_edge_cases():
    assert roman_to_int("II") == 2
    assert roman_to_int("IV") == 4
    assert roman_to_int("VIII") == 8
    assert roman_to_int("XLIX") == 49
    assert roman_to_int("MCMXLIV") == 1944
    assert roman_to_int("MMXXIII") == 2023
