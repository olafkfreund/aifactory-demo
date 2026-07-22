"""Unit tests for the clamp helper function."""

import pytest

from src.app.math import clamp


def test_clamp_value_in_range():
    """Test that a value within range is returned unchanged."""
    assert clamp(5, 0, 10) == 5
    assert clamp(3, 0, 10) == 3
    assert clamp(7, 0, 10) == 7


def test_clamp_value_below_range():
    """Test that a value below range is clamped to low."""
    assert clamp(-3, 0, 10) == 0
    assert clamp(-100, 0, 10) == 0
    assert clamp(-1, 5, 20) == 5


def test_clamp_value_above_range():
    """Test that a value above range is clamped to high."""
    assert clamp(99, 0, 10) == 10
    assert clamp(100, 0, 10) == 10
    assert clamp(21, 5, 20) == 20


def test_clamp_boundary_low():
    """Test that a value equal to low is returned unchanged."""
    assert clamp(0, 0, 10) == 0
    assert clamp(5, 5, 10) == 5


def test_clamp_boundary_high():
    """Test that a value equal to high is returned unchanged."""
    assert clamp(10, 0, 10) == 10
    assert clamp(20, 5, 20) == 20


def test_clamp_float_values():
    """Test that clamp works correctly with float values."""
    assert clamp(7.5, 0, 10) == 7.5
    assert clamp(2.3, 0, 10) == 2.3
    assert clamp(-1.5, 0, 10) == 0
    assert clamp(15.7, 0, 10) == 10
    assert clamp(0.0, 0.0, 10.0) == 0.0
    assert clamp(10.0, 0.0, 10.0) == 10.0
    assert clamp(5.5, 5.5, 10.0) == 5.5


def test_clamp_int_values():
    """Test that clamp works correctly with int values."""
    assert clamp(5, 0, 10) == 5
    assert clamp(0, 0, 10) == 0
    assert clamp(10, 0, 10) == 10
    assert clamp(-5, 0, 10) == 0
    assert clamp(15, 0, 10) == 10


def test_clamp_error_case_low_greater_than_high():
    """Test that ValueError is raised when low > high."""
    with pytest.raises(ValueError):
        clamp(5, 10, 0)

    with pytest.raises(ValueError):
        clamp(5, 100, 50)

    with pytest.raises(ValueError):
        clamp(7.5, 10.0, 5.0)


def test_clamp_equal_bounds():
    """Test clamp when low equals high."""
    assert clamp(5, 10, 10) == 10
    assert clamp(15, 10, 10) == 10
    assert clamp(10, 10, 10) == 10
