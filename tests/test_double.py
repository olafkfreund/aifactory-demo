"""Tests for the double utility function."""

import pytest

from src.app.helpers.double import double


class TestDoubleBasics:
    """Test basic functionality of the double() function."""

    def test_double_positive_integer(self):
        """AC1: double(4) returns 8."""
        assert double(4) == 8

    def test_double_zero(self):
        """Test that double(0) returns 0."""
        assert double(0) == 0

    def test_double_negative_integer(self):
        """Test that double() works with negative integers."""
        assert double(-5) == -10

    def test_double_positive_float(self):
        """Test that double() works with positive floats."""
        assert double(2.5) == 5.0

    def test_double_negative_float(self):
        """Test that double() works with negative floats."""
        assert double(-3.5) == -7.0

    def test_double_small_float(self):
        """Test that double() works with small floats."""
        assert double(0.1) == pytest.approx(0.2)


class TestDoubleInputValidation:
    """Test input validation and error handling."""

    def test_double_string_raises_type_error(self):
        """AC2: double("x") raises TypeError."""
        with pytest.raises(TypeError):
            double("x")

    def test_double_empty_string_raises_type_error(self):
        """Test that double("") raises TypeError."""
        with pytest.raises(TypeError):
            double("")

    def test_double_boolean_raises_type_error(self):
        """Test that double(True) raises TypeError (bool is not accepted)."""
        with pytest.raises(TypeError):
            double(True)

    def test_double_boolean_false_raises_type_error(self):
        """Test that double(False) raises TypeError."""
        with pytest.raises(TypeError):
            double(False)

    def test_double_none_raises_type_error(self):
        """Test that double(None) raises TypeError."""
        with pytest.raises(TypeError):
            double(None)

    def test_double_list_raises_type_error(self):
        """Test that double([1, 2]) raises TypeError."""
        with pytest.raises(TypeError):
            double([1, 2])

    def test_double_dict_raises_type_error(self):
        """Test that double({}) raises TypeError."""
        with pytest.raises(TypeError):
            double({})

    def test_double_tuple_raises_type_error(self):
        """Test that double((1, 2)) raises TypeError."""
        with pytest.raises(TypeError):
            double((1, 2))

    def test_double_type_error_message_contains_type_name(self):
        """Test that TypeError message includes the invalid type name."""
        with pytest.raises(TypeError) as exc_info:
            double("test")
        assert "str" in str(exc_info.value)
