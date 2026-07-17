"""Tests for ordinal number renderer helper."""
import pytest

from helpers.ordinal import ordinal


def test_ordinal_1st():
    """Test that 1 converts to '1st'."""
    assert ordinal(1) == "1st"


def test_ordinal_2nd():
    """Test that 2 converts to '2nd'."""
    assert ordinal(2) == "2nd"


def test_ordinal_3rd():
    """Test that 3 converts to '3rd'."""
    assert ordinal(3) == "3rd"


def test_ordinal_4th():
    """Test that 4 converts to '4th'."""
    assert ordinal(4) == "4th"


def test_ordinal_11th():
    """Test that 11 converts to '11th' (not '11st')."""
    assert ordinal(11) == "11th"


def test_ordinal_12th():
    """Test that 12 converts to '12th' (not '12nd')."""
    assert ordinal(12) == "12th"


def test_ordinal_13th():
    """Test that 13 converts to '13th' (not '13rd')."""
    assert ordinal(13) == "13th"


def test_ordinal_21st():
    """Test that 21 converts to '21st'."""
    assert ordinal(21) == "21st"


def test_ordinal_22nd():
    """Test that 22 converts to '22nd'."""
    assert ordinal(22) == "22nd"


def test_ordinal_23rd():
    """Test that 23 converts to '23rd'."""
    assert ordinal(23) == "23rd"


def test_ordinal_24th():
    """Test that 24 converts to '24th'."""
    assert ordinal(24) == "24th"


def test_ordinal_100th():
    """Test that 100 converts to '100th'."""
    assert ordinal(100) == "100th"


def test_ordinal_101st():
    """Test that 101 converts to '101st'."""
    assert ordinal(101) == "101st"


def test_ordinal_111th():
    """Test that 111 converts to '111th' (not '111st')."""
    assert ordinal(111) == "111th"


def test_ordinal_112th():
    """Test that 112 converts to '112th' (not '112nd')."""
    assert ordinal(112) == "112th"


def test_ordinal_113th():
    """Test that 113 converts to '113th' (not '113rd')."""
    assert ordinal(113) == "113th"


def test_ordinal_0th():
    """Test that 0 converts to '0th'."""
    assert ordinal(0) == "0th"


def test_ordinal_negative_1st():
    """Test that -1 converts to '-1st'."""
    assert ordinal(-1) == "-1st"


def test_ordinal_negative_2nd():
    """Test that -2 converts to '-2nd'."""
    assert ordinal(-2) == "-2nd"


def test_ordinal_negative_11th():
    """Test that -11 converts to '-11th'."""
    assert ordinal(-11) == "-11th"


def test_ordinal_large_number():
    """Test that large numbers work correctly."""
    assert ordinal(1001) == "1001st"
    assert ordinal(1002) == "1002nd"
    assert ordinal(1003) == "1003rd"
    assert ordinal(1004) == "1004th"


def test_ordinal_type_error_float():
    """Test that passing a float raises TypeError."""
    with pytest.raises(TypeError):
        ordinal(1.5)


def test_ordinal_type_error_string():
    """Test that passing a string raises TypeError."""
    with pytest.raises(TypeError):
        ordinal("1")


def test_ordinal_type_error_none():
    """Test that passing None raises TypeError."""
    with pytest.raises(TypeError):
        ordinal(None)
