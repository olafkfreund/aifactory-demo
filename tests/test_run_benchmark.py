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

import pytest

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


# --- verify poll terminal-state detection -------------------------------------
# A verify status that isn't recognised as terminal makes the poll wait the full
# VERIFY_TIMEOUT (60 min) for a verdict that never comes. ``planner_failed`` (the
# spec-ingest planner raised before any lane ran — e.g. the project's on-disk
# clone was absent after a pod/PVC recycle) hung a go-hello run for the full hour
# until it was added here.
_verify_is_terminal = run_benchmark.verify_is_terminal


def test_planner_failed_is_terminal() -> None:
    # The status that hung the go-hello verify poll for the full VERIFY_TIMEOUT.
    assert _verify_is_terminal("planner_failed") is True


def test_enumerated_terminal_verdicts() -> None:
    for status in ("completed", "passed", "triaged", "triaged_empty", "failed"):
        assert _verify_is_terminal(status) is True, status


def test_any_phase_failure_suffix_is_terminal() -> None:
    # We don't enumerate every <phase>_failed TFactory might add — the suffix
    # rule must catch them all (and *_error / *_exception).
    for status in ("coder_failed", "triager_error", "planner_initial_exception"):
        assert _verify_is_terminal(status) is True, status


def test_in_progress_statuses_are_not_terminal() -> None:
    for status in ("planning", "running", "pending", "in_progress", ""):
        assert _verify_is_terminal(status) is False, status


# ── Per-phase model pinning (Factory#295 cells B1-B4 / C1-C4) ──────────────
#
# phaseModels is the ONLY surface that switches provider. If a pin silently
# resolves to something else the run still completes, and gets published as a
# result for a backend that never ran — the exact failure this validation
# program exists to prevent. So the env parsing fails closed.

_phase_models_from_env = run_benchmark._phase_models_from_env


def test_no_env_means_no_pins(monkeypatch: pytest.MonkeyPatch) -> None:
    for var in ("BENCH_OLLAMA", "BENCH_PHASE_MODELS"):
        monkeypatch.delenv(var, raising=False)
    assert _phase_models_from_env() == {}


def test_ollama_preset_pins_every_phase(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("BENCH_PHASE_MODELS", raising=False)
    monkeypatch.setenv("BENCH_OLLAMA", "1")
    monkeypatch.setenv("BENCH_OLLAMA_CODING_MODEL", "openai-compatible:qwen2.5-coder:14b")
    monkeypatch.setenv("BENCH_OLLAMA_GENERAL_MODEL", "openai-compatible:gemma4:12b")
    pm = _phase_models_from_env()
    assert set(pm) == set(run_benchmark._PHASES)
    assert pm["coding"] == "openai-compatible:qwen2.5-coder:14b"
    assert pm["planning"] == "openai-compatible:gemma4:12b"


def test_explicit_pins_stand_alone(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("BENCH_OLLAMA", raising=False)
    monkeypatch.setenv("BENCH_PHASE_MODELS", '{"coding": "antigravity-3-pro"}')
    assert _phase_models_from_env() == {"coding": "antigravity-3-pro"}


def test_explicit_pins_override_the_preset(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("BENCH_OLLAMA", "1")
    monkeypatch.setenv("BENCH_PHASE_MODELS", '{"coding": "opus"}')
    pm = _phase_models_from_env()
    assert pm["coding"] == "opus"                      # the override won
    assert pm["qa"].startswith("openai-compatible:")   # the preset survived elsewhere


def test_unknown_phase_is_rejected_not_dropped(monkeypatch: pytest.MonkeyPatch) -> None:
    # Both AIFactory and TFactory silently DROP unknown keys. A run pinned to
    # "testing" would quietly use the default model and then be written up as a
    # result for the pinned one, so refuse to start instead.
    monkeypatch.delenv("BENCH_OLLAMA", raising=False)
    monkeypatch.setenv("BENCH_PHASE_MODELS", '{"testing": "opus"}')
    with pytest.raises(SystemExit) as err:
        _phase_models_from_env()
    assert "testing" in str(err.value)


def test_malformed_json_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("BENCH_OLLAMA", raising=False)
    monkeypatch.setenv("BENCH_PHASE_MODELS", "coding=opus")
    with pytest.raises(SystemExit):
        _phase_models_from_env()


def test_non_object_json_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("BENCH_OLLAMA", raising=False)
    monkeypatch.setenv("BENCH_PHASE_MODELS", '["opus"]')
    with pytest.raises(SystemExit):
        _phase_models_from_env()
