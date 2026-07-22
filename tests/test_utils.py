import pytest

from app.utils import clamp


def test_clamp_below_range():
    """Test that values below the range return the low bound."""
    assert clamp(-3, 0, 10) == 0


def test_clamp_above_range():
    """Test that values above the range return the high bound."""
    assert clamp(99, 0, 10) == 10


def test_clamp_in_range():
    """Test that values within the range are returned unchanged."""
    assert clamp(5, 0, 10) == 5


def test_clamp_lower_boundary():
    """Test that values equal to the low bound are returned unchanged."""
    assert clamp(0, 0, 10) == 0


def test_clamp_upper_boundary():
    """Test that values equal to the high bound are returned unchanged."""
    assert clamp(10, 0, 10) == 10


def test_clamp_float_inputs():
    """Test that clamp works correctly with float inputs."""
    assert clamp(7.5, 0, 10) == 7.5
    assert clamp(7.5, 0.0, 10.0) == 7.5
    assert clamp(0.5, 0.1, 0.9) == 0.5
    assert clamp(0.05, 0.1, 0.9) == 0.1
    assert clamp(0.95, 0.1, 0.9) == 0.9


def test_clamp_integer_inputs():
    """Test that clamp works correctly with integer inputs."""
    assert clamp(5, 0, 10) == 5
    assert clamp(-3, 0, 10) == 0
    assert clamp(15, 0, 10) == 10


def test_clamp_negative_ranges():
    """Test that clamp works correctly with negative ranges."""
    assert clamp(-5, -10, 0) == -5
    assert clamp(-15, -10, 0) == -10
    assert clamp(5, -10, 0) == 0


def test_clamp_raises_value_error_when_low_greater_than_high():
    """Test that ValueError is raised when low > high."""
    with pytest.raises(ValueError):
        clamp(5, 10, 0)


def test_clamp_raises_value_error_with_negative_ranges():
    """Test that ValueError is raised when low > high with negative values."""
    with pytest.raises(ValueError):
        clamp(-5, 0, -10)


def test_clamp_equal_low_and_high():
    """Test that clamp works when low equals high."""
    assert clamp(5, 5, 5) == 5
    assert clamp(0, 5, 5) == 5
    assert clamp(10, 5, 5) == 5
