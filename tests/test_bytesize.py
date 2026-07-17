"""Tests for the human_bytes helper function."""

import pytest

from helpers.bytesize import human_bytes


class TestHumanBytesBasic:
    """Test basic human_bytes functionality."""

    def test_zero_bytes(self):
        """Test zero bytes."""
        assert human_bytes(0) == "0B"

    def test_single_byte(self):
        """Test single byte."""
        assert human_bytes(1) == "1B"

    def test_small_byte_values(self):
        """Test small byte values."""
        assert human_bytes(512) == "512B"
        assert human_bytes(1023) == "1023B"


class TestHumanBytesKilobytes:
    """Test kilobyte formatting."""

    def test_one_kilobyte(self):
        """Test exactly 1 kilobyte."""
        assert human_bytes(1024) == "1.0KB"

    def test_kilobyte_values(self):
        """Test various kilobyte values."""
        assert human_bytes(2048) == "2.0KB"
        assert human_bytes(5120) == "5.0KB"
        assert human_bytes(10240) == "10.0KB"

    def test_kilobyte_decimal_precision(self):
        """Test that kilobytes show one decimal place."""
        assert human_bytes(1536) == "1.5KB"
        assert human_bytes(2560) == "2.5KB"
        assert human_bytes(1280) == "1.2KB"
        assert human_bytes(1945) == "1.9KB"

    def test_kilobyte_rounding(self):
        """Test rounding of kilobyte values."""
        assert human_bytes(1638) == "1.6KB"
        assert human_bytes(1843) == "1.8KB"

    def test_near_megabyte_boundary(self):
        """Test values near 1 megabyte boundary."""
        assert human_bytes(1047552) == "1023.0KB"
        assert human_bytes(1048575) == "1024.0KB"


class TestHumanBytesMegabytes:
    """Test megabyte formatting."""

    def test_one_megabyte(self):
        """Test exactly 1 megabyte."""
        assert human_bytes(1048576) == "1.0MB"

    def test_megabyte_values(self):
        """Test various megabyte values."""
        assert human_bytes(2097152) == "2.0MB"
        assert human_bytes(5242880) == "5.0MB"
        assert human_bytes(10485760) == "10.0MB"

    def test_megabyte_decimal_precision(self):
        """Test that megabytes show one decimal place."""
        assert human_bytes(1572864) == "1.5MB"
        assert human_bytes(2621440) == "2.5MB"
        assert human_bytes(1310720) == "1.2MB"
        assert human_bytes(1991885) == "1.9MB"

    def test_megabyte_rounding(self):
        """Test rounding of megabyte values."""
        assert human_bytes(1677722) == "1.6MB"
        assert human_bytes(1887436) == "1.8MB"

    def test_near_gigabyte_boundary(self):
        """Test values near 1 gigabyte boundary."""
        assert human_bytes(1072668672) == "1023.0MB"
        assert human_bytes(1073741823) == "1024.0MB"


class TestHumanBytesGigabytes:
    """Test gigabyte formatting."""

    def test_one_gigabyte(self):
        """Test exactly 1 gigabyte."""
        assert human_bytes(1073741824) == "1.0GB"

    def test_gigabyte_values(self):
        """Test various gigabyte values."""
        assert human_bytes(2147483648) == "2.0GB"
        assert human_bytes(5368709120) == "5.0GB"
        assert human_bytes(10737418240) == "10.0GB"

    def test_gigabyte_decimal_precision(self):
        """Test that gigabytes show one decimal place."""
        assert human_bytes(1610612736) == "1.5GB"
        assert human_bytes(2684354560) == "2.5GB"
        assert human_bytes(1342177280) == "1.2GB"
        assert human_bytes(2040109465) == "1.9GB"

    def test_gigabyte_rounding(self):
        """Test rounding of gigabyte values."""
        assert human_bytes(1717986918) == "1.6GB"
        assert human_bytes(1929379655) == "1.8GB"

    def test_large_gigabyte_values(self):
        """Test large gigabyte values."""
        assert human_bytes(107374182400) == "100.0GB"
        assert human_bytes(1099511627776) == "1024.0GB"


class TestHumanBytesFloatInputs:
    """Test handling of float inputs."""

    def test_float_bytes(self):
        """Test float input in byte range."""
        assert human_bytes(512.5) == "512B"
        assert human_bytes(1023.9) == "1023B"

    def test_float_kilobytes(self):
        """Test float input in kilobyte range."""
        assert human_bytes(1024.0) == "1.0KB"
        assert human_bytes(1536.5) == "1.5KB"
        assert human_bytes(2048.3) == "2.0KB"

    def test_float_megabytes(self):
        """Test float input in megabyte range."""
        assert human_bytes(1048576.0) == "1.0MB"
        assert human_bytes(1572864.7) == "1.5MB"

    def test_float_gigabytes(self):
        """Test float input in gigabyte range."""
        assert human_bytes(1073741824.0) == "1.0GB"
        assert human_bytes(1610612736.5) == "1.5GB"


class TestHumanBytesEdgeCases:
    """Test edge cases."""

    def test_boundary_values(self):
        """Test exact boundary values."""
        # Just below KB
        assert human_bytes(1023) == "1023B"
        # Exactly at KB
        assert human_bytes(1024) == "1.0KB"

        # Just below MB
        assert human_bytes(1048576 - 1) == "1024.0KB"
        # Exactly at MB
        assert human_bytes(1048576) == "1.0MB"

        # Just below GB
        assert human_bytes(1073741824 - 1) == "1024.0MB"
        # Exactly at GB
        assert human_bytes(1073741824) == "1.0GB"

    def test_very_large_values(self):
        """Test very large byte counts."""
        assert human_bytes(1099511627776) == "1024.0GB"  # 1 TB
        assert human_bytes(10995116277760) == "10240.0GB"  # 10 TB


class TestHumanBytesRealWorld:
    """Test real-world use cases."""

    def test_file_sizes(self):
        """Test common file size scenarios."""
        # Text file
        assert human_bytes(256) == "256B"
        # Small image
        assert human_bytes(614400) == "600.0KB"
        # Large image
        assert human_bytes(5242880) == "5.0MB"
        # Video file
        assert human_bytes(1073741824) == "1.0GB"

    def test_storage_scenarios(self):
        """Test storage device scenarios."""
        # USB drive
        assert human_bytes(4294967296) == "4.0GB"
        # Small SSD
        assert human_bytes(536870912000) == "500.0GB"
        # Large HDD
        assert human_bytes(2199023255552) == "2048.0GB"

    def test_network_traffic(self):
        """Test network traffic scenarios."""
        # Single packet
        assert human_bytes(1500) == "1.5KB"
        # HTTP response
        assert human_bytes(102400) == "100.0KB"
        # Large download
        assert human_bytes(536870912) == "512.0MB"
