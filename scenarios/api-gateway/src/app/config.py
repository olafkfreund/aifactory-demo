import os
from dataclasses import dataclass

@dataclass
class Settings:
    rate_limit_max: int
    rate_limit_window_seconds: int

def _parse_int(value: str, default: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default

def get_settings() -> Settings:
    """Read rate limit settings from environment variables.

    Returns a new Settings instance on each call, reading the current
    environment variables. Defaults are used if variables are missing or
    cannot be parsed as integers.
    """
    max_val = _parse_int(os.getenv("RATE_LIMIT_MAX"), 5)
    window_val = _parse_int(os.getenv("RATE_LIMIT_WINDOW_SECONDS"), 1)
    return Settings(rate_limit_max=max_val, rate_limit_window_seconds=window_val)
