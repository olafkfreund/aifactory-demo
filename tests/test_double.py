from src.app.helpers.double import double


def test_double_returns_doubled_value():
    """Test that double(4) returns 8."""
    assert double(4) == 8


def test_double_with_zero():
    """Test that double(0) returns 0."""
    assert double(0) == 0


def test_double_with_negative():
    """Test that double(-5) returns -10."""
    assert double(-5) == -10
