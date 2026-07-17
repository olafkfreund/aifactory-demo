"""Pytest configuration for aifactory-demo."""

import sys
from pathlib import Path

# Add src directory to Python path so pytest can find app modules
src_path = Path(__file__).parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))
