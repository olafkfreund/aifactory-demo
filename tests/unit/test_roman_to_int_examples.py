# AC#3: Examples: roman_to_int("III") == 3, roman_to_int("LVIII") == 58,
#       roman_to_int("MCMXCIV") == 1994.
import pytest

from app.helpers import roman_to_int


@pytest.mark.parametrize(
    "numeral,expected",
    [
        ("III", 3),
        ("LVIII", 58),
        ("MCMXCIV", 1994),
    ],
    ids=["III=3", "LVIII=58", "MCMXCIV=1994"],
)
def test_roman_to_int_spec_examples_return_expected_value(numeral, expected):
    assert roman_to_int(numeral) == expected
