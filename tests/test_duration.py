"""Tests for the duration formatter helper."""

import pytest

from src.app.helpers.duration import human_duration


def test_human_duration_basic():
    """Test basic duration formatting."""
    assert human_duration(7502) == "2h 5m 2s"


def test_human_duration_minutes_seconds():
    """Test duration with only minutes and seconds."""
    assert human_duration(125) == "2m 5s"


def test_human_duration_seconds_only():
    """Test duration with only seconds."""
    assert human_duration(45) == "45s"


def test_human_duration_zero():
    """Test zero duration."""
    assert human_duration(0) == "0s"


def test_human_duration_hours_only():
    """Test duration with only hours."""
    assert human_duration(3600) == "1h"


def test_human_duration_minutes_only():
    """Test duration with only minutes."""
    assert human_duration(300) == "5m"


def test_human_duration_large_duration():
    """Test large duration with all components."""
    # 1 hour + 30 minutes + 45 seconds = 5445 seconds
    assert human_duration(5445) == "1h 30m 45s"


def test_human_duration_float_input():
    """Test that float inputs are handled correctly."""
    assert human_duration(125.7) == "2m 5s"


def test_human_duration_negative():
    """Test that negative durations raise an error."""
    with pytest.raises(ValueError, match="Duration cannot be negative"):
        human_duration(-100)


def test_human_duration_very_large():
    """Test very large duration."""
    # 100 hours + 15 minutes + 30 seconds
    assert human_duration(360930) == "100h 15m 30s"
