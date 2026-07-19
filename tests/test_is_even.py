from src.app.helpers.is_even import is_even


def test_is_even_zero():
    """Test that zero is even."""
    assert is_even(0) is True


def test_is_even_positive_even():
    """Test that positive even numbers return True."""
    assert is_even(4) is True


def test_is_even_negative_even():
    """Test that negative even numbers return True."""
    assert is_even(-2) is True


def test_is_even_positive_odd():
    """Test that positive odd numbers return False."""
    assert is_even(3) is False


def test_is_even_negative_odd():
    """Test that negative odd numbers return False."""
    assert is_even(-7) is False
