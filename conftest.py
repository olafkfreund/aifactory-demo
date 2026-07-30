"""Root conftest — add src/ to sys.path for the src-layout package.

pytest does not automatically add ``src/`` to the import path when using
a source layout (``src/app/...``).  Adding it here avoids requiring callers
to set ``PYTHONPATH=src`` manually or touching the shared pyproject.toml.
"""

import sys
from pathlib import Path

# Insert src/ at the front of sys.path so ``import app`` resolves to
# src/app/ regardless of how pytest is invoked.
sys.path.insert(0, str(Path(__file__).parent / "src"))
