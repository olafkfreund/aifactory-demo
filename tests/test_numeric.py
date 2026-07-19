"""Unit tests for numeric utilities."""

import pytest

from src.app.numeric import clamp


def test_clamp_below_range_integer():
    """Test clamping a value below the range returns low."""
    assert clamp(-3, 0, 10) == 0


def test_clamp_above_range_integer():
    """Test clamping a value above the range returns high."""
    assert clamp(99, 0, 10) == 10


def test_clamp_in_range_integer():
    """Test clamping a value within range returns unchanged."""
    assert clamp(5, 0, 10) == 5


def test_clamp_boundary_low():
    """Test clamping a value equal to low returns that value."""
    assert clamp(0, 0, 10) == 0


def test_clamp_boundary_high():
    """Test clamping a value equal to high returns that value."""
    assert clamp(10, 0, 10) == 10


def test_clamp_float_input():
    """Test clamping works with float inputs."""
    assert clamp(7.5, 0, 10) == 7.5


def test_clamp_float_below_range():
    """Test clamping a float below range."""
    assert clamp(-2.5, 0.0, 10.0) == 0.0


def test_clamp_float_above_range():
    """Test clamping a float above range."""
    assert clamp(15.7, 0.0, 10.0) == 10.0


def test_clamp_float_boundaries():
    """Test clamping with float boundaries."""
    assert clamp(2.5, 2.5, 7.5) == 2.5
    assert clamp(7.5, 2.5, 7.5) == 7.5


def test_clamp_negative_range():
    """Test clamping works with negative ranges."""
    assert clamp(-15, -10, -5) == -10
    assert clamp(-3, -10, -5) == -5
    assert clamp(-7, -10, -5) == -7


def test_clamp_invalid_range_raises_error():
    """Test that low > high raises ValueError."""
    with pytest.raises(ValueError):
        clamp(5, 10, 0)


def test_clamp_invalid_range_message():
    """Test that ValueError message is descriptive."""
    with pytest.raises(ValueError, match="low .* must be <= high"):
        clamp(5, 10, 0)


def test_clamp_zero_range():
    """Test clamping with identical low and high."""
    assert clamp(5, 0, 0) == 0
    assert clamp(-5, 0, 0) == 0
    assert clamp(0, 0, 0) == 0
