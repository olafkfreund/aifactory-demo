# AC#1: The feature works as described: Add an is_even(n) helper.
# Verify is_even returns True for even integers and False for odd integers,
# including zero and negatives.
import pytest

from app.helpers.is_even import is_even


@pytest.mark.parametrize(
    "n",
    [2, 4, 100, 0, -2, -4, -100],
    ids=[
        "positive-even-2",
        "positive-even-4",
        "positive-even-100",
        "zero-is-even",
        "negative-even-2",
        "negative-even-4",
        "negative-even-100",
    ],
)
def test_is_even_even_integer_returns_true(n):
    assert is_even(n) is True


@pytest.mark.parametrize(
    "n",
    [1, 3, 99, -1, -3, -99],
    ids=[
        "positive-odd-1",
        "positive-odd-3",
        "positive-odd-99",
        "negative-odd-1",
        "negative-odd-3",
        "negative-odd-99",
    ],
)
def test_is_even_odd_integer_returns_false(n):
    assert is_even(n) is False
