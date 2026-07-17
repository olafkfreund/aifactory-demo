"""Tests for email validator."""

from src.app.validators.email import is_valid_email


class TestValidateEmail:
    """Test cases for is_valid_email function."""

    # Valid cases - should return True
    def test_valid_email(self):
        """Test validation of a valid email address."""
        assert is_valid_email("user@example.com") is True

    def test_valid_email_with_uppercase(self):
        """Test that uppercase emails are valid."""
        assert is_valid_email("User@Example.COM") is True

    def test_valid_email_with_subdomain(self):
        """Test validation with subdomain."""
        assert is_valid_email("user@mail.example.co.uk") is True

    def test_valid_email_with_plus(self):
        """Test validation with plus addressing."""
        assert is_valid_email("user+tag@example.com") is True

    def test_valid_email_with_numbers(self):
        """Test validation with numbers in local part."""
        assert is_valid_email("user123@example.com") is True

    def test_valid_email_with_dots(self):
        """Test validation with dots in local part."""
        assert is_valid_email("user.name@example.com") is True

    def test_valid_email_with_underscore(self):
        """Test validation with underscore in local part."""
        assert is_valid_email("user_name@example.com") is True

    def test_email_with_leading_whitespace(self):
        """Test that leading whitespace is handled."""
        assert is_valid_email("  user@example.com") is True

    def test_email_with_trailing_whitespace(self):
        """Test that trailing whitespace is handled."""
        assert is_valid_email("user@example.com  ") is True

    # Invalid cases - should return False
    def test_invalid_email_no_at_sign(self):
        """Test rejection of email without @ sign."""
        assert is_valid_email("userexample.com") is False

    def test_invalid_email_no_domain(self):
        """Test rejection of email without domain."""
        assert is_valid_email("user@") is False

    def test_invalid_email_no_local_part(self):
        """Test rejection of email without local part."""
        assert is_valid_email("@example.com") is False

    def test_invalid_email_no_tld(self):
        """Test rejection of email without top-level domain."""
        assert is_valid_email("user@example") is False

    def test_invalid_email_empty_string(self):
        """Test rejection of empty string."""
        assert is_valid_email("") is False

    def test_invalid_email_whitespace_only(self):
        """Test rejection of whitespace-only string."""
        assert is_valid_email("   ") is False

    def test_invalid_email_invalid_characters(self):
        """Test rejection of invalid characters."""
        assert is_valid_email("user@exam ple.com") is False

    def test_invalid_email_not_string(self):
        """Test rejection of non-string input."""
        assert is_valid_email(123) is False

    def test_invalid_email_multiple_at_signs(self):
        """Test rejection of multiple @ signs."""
        assert is_valid_email("user@exam@ple.com") is False

    def test_invalid_email_consecutive_dots(self):
        """Test rejection of consecutive dots in local part."""
        assert is_valid_email("user..name@example.com") is False
