"""Regression tests for the benchmark harness epic-reference handling.

Guards the "wall of text" cockpit bug: PFactory's ``/emit`` returns the whole
session (``session.model_dump()``), whose ``epic`` key is the full EpicPlan
object. The harness must reduce that to a SHORT scalar id before dropping it
into a ``Correlation epic #<id>`` task description — never ``str()`` the dict.
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

_SPEC = importlib.util.spec_from_file_location(
    "run_benchmark",
    Path(__file__).resolve().parents[1] / "scripts" / "run_benchmark.py",
)
assert _SPEC and _SPEC.loader
run_benchmark = importlib.util.module_from_spec(_SPEC)
sys.modules["run_benchmark"] = run_benchmark
_SPEC.loader.exec_module(run_benchmark)

_epic_ref = run_benchmark._epic_ref

# The exact polluting payload shape: epic_number absent/falsy, ``epic`` carries
# the full stringifiable EpicPlan dict (plan_id, children, effort_estimate).
_POLLUTING_EMIT = {
    "epic_number": None,
    "epic": {
        "plan_id": "016-fastapi-api-gateway-with-rate-limiting",
        "epic_title": "FastAPI API gateway",
        "children": [{"key": "C1", "title": "AC#1"}, {"key": "C2"}],
        "effort_estimate": {"story_points": 24},
    },
}


def test_epic_ref_prefers_issue_number() -> None:
    assert _epic_ref({"epic_number": 101, "epic": {"plan_id": "016-x"}}) == "101"


def test_epic_ref_falls_back_to_correlation_key() -> None:
    assert _epic_ref({"epic_number": None, "correlation_key": "42"}) == "42"


def test_epic_ref_uses_plan_id_not_the_whole_dict() -> None:
    ref = _epic_ref(_POLLUTING_EMIT)
    assert ref == "016-fastapi-api-gateway-with-rate-limiting"


def test_epic_ref_never_returns_a_stringified_dict() -> None:
    ref = _epic_ref(_POLLUTING_EMIT)
    # The bug was ``str(emit.get("epic"))`` leaking the plan dict into the
    # description. The reference must be a short scalar id with no dict guts.
    assert "{" not in ref
    assert "children" not in ref
    assert "effort_estimate" not in ref
    assert "plan_id" not in ref  # only the *value*, never the key/braces


def test_epic_ref_accepts_a_bare_scalar_epic() -> None:
    assert _epic_ref({"epic": 77}) == "77"


def test_epic_ref_empty_when_no_short_id_available() -> None:
    assert _epic_ref({}) == ""
    assert _epic_ref({"epic": {"epic_title": "no plan_id here"}}) == ""


def test_description_reference_has_no_embedded_plan_dict() -> None:
    """End-to-end shape: the description the harness builds is clean."""
    epic = _epic_ref(_POLLUTING_EMIT) or "sess-123"
    description = (
        f"Benchmark scenario api-gateway. Build under scenarios/api-gateway/. "
        f"Correlation epic #{epic}. See benchmarks/scenarios/api-gateway/brief.md."
    )
    assert "children" not in description
    assert "effort_estimate" not in description
    assert "{'plan_id'" not in description
    assert "Correlation epic #016-fastapi-api-gateway-with-rate-limiting." in description
