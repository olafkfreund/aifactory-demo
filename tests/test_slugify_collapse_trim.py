# Acceptance criterion (AC#3):
#   slugify("  --Multiple   spaces & symbols!!  ") == "multiple-spaces-symbols"
# Runs of spaces/symbols collapse to single hyphens and leading/trailing
# hyphens are trimmed.

from app.slugify import slugify


def test_slugify_runs_and_symbols_collapses_and_trims():
    assert slugify("  --Multiple   spaces & symbols!!  ") == "multiple-spaces-symbols"
