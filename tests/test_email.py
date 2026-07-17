"""Tests for email validator."""

import pytest

from src.app.validators.email import InvalidEmailError, validate_email


class TestValidateEmail:
    """Test cases for validate_email function."""

    def test_valid_email(self):
        """Test validation of a valid email address."""
        result = validate_email("user@example.com")
        assert result == "user@example.com"

    def test_valid_email_with_uppercase(self):
        """Test that uppercase emails are lowercased."""
        result = validate_email("User@Example.COM")
        assert result == "user@example.com"

    def test_valid_email_with_subdomain(self):
        """Test validation with subdomain."""
        result = validate_email("user@mail.example.co.uk")
        assert result == "user@mail.example.co.uk"

    def test_valid_email_with_plus(self):
        """Test validation with plus addressing."""
        result = validate_email("user+tag@example.com")
        assert result == "user+tag@example.com"

    def test_valid_email_with_numbers(self):
        """Test validation with numbers in local part."""
        result = validate_email("user123@example.com")
        assert result == "user123@example.com"

    def test_valid_email_with_dots(self):
        """Test validation with dots in local part."""
        result = validate_email("user.name@example.com")
        assert result == "user.name@example.com"

    def test_valid_email_with_underscore(self):
        """Test validation with underscore in local part."""
        result = validate_email("user_name@example.com")
        assert result == "user_name@example.com"

    def test_email_with_leading_whitespace(self):
        """Test that leading whitespace is stripped."""
        result = validate_email("  user@example.com")
        assert result == "user@example.com"

    def test_email_with_trailing_whitespace(self):
        """Test that trailing whitespace is stripped."""
        result = validate_email("user@example.com  ")
        assert result == "user@example.com"

    def test_invalid_email_no_at_sign(self):
        """Test rejection of email without @ sign."""
        with pytest.raises(InvalidEmailError):
            validate_email("userexample.com")

    def test_invalid_email_no_domain(self):
        """Test rejection of email without domain."""
        with pytest.raises(InvalidEmailError):
            validate_email("user@")

    def test_invalid_email_no_local_part(self):
        """Test rejection of email without local part."""
        with pytest.raises(InvalidEmailError):
            validate_email("@example.com")

    def test_invalid_email_no_tld(self):
        """Test rejection of email without top-level domain."""
        with pytest.raises(InvalidEmailError):
            validate_email("user@example")

    def test_invalid_email_empty_string(self):
        """Test rejection of empty string."""
        with pytest.raises(InvalidEmailError):
            validate_email("")

    def test_invalid_email_whitespace_only(self):
        """Test rejection of whitespace-only string."""
        with pytest.raises(InvalidEmailError):
            validate_email("   ")

    def test_invalid_email_invalid_characters(self):
        """Test rejection of invalid characters."""
        with pytest.raises(InvalidEmailError):
            validate_email("user@exam ple.com")

    def test_invalid_email_not_string(self):
        """Test rejection of non-string input."""
        with pytest.raises(InvalidEmailError):
            validate_email(123)

    def test_invalid_email_multiple_at_signs(self):
        """Test rejection of multiple @ signs."""
        with pytest.raises(InvalidEmailError):
            validate_email("user@exam@ple.com")

    def test_invalid_email_consecutive_dots(self):
        """Test rejection of consecutive dots in local part."""
        with pytest.raises(InvalidEmailError):
            validate_email("user..name@example.com")
