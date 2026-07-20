"""Tests for helper functions."""

import pytest

from app.helpers import factorial


def test_factorial_of_zero():
    assert factorial(0) == 1


def test_factorial_of_one():
    assert factorial(1) == 1


def test_factorial_of_five():
    assert factorial(5) == 120


def test_factorial_of_ten():
    assert factorial(10) == 3628800


def test_factorial_negative_raises_error():
    with pytest.raises(ValueError, match="negative"):
        factorial(-1)
