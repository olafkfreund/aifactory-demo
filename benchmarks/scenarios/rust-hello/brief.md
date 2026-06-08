# Scenario 2 — Rust hello-world greeting library + CLI

A small **Rust** crate built into `scenarios/rust-hello/` on branch
`bench/rust-hello`, verified with `cargo test`.

## Goal

A reusable greeting library plus a thin CLI binary, idiomatic Rust with unit
tests — the simplest scenario, to baseline plan/code/verify on a compiled
language.

## Scope

- A library function `greet(name: &str) -> String`.
- A binary (`main.rs`) that reads the first CLI arg and prints the greeting.
- A Cargo project (`Cargo.toml`, `src/lib.rs`, `src/main.rs`) under the subdir.

## Acceptance Criteria

- AC#1: `greet("World")` returns exactly `"Hello, World!"`.
- AC#2: `greet("")` returns exactly `"Hello, stranger!"` (empty name → friendly default).
- AC#3: `greet` trims surrounding whitespace from the name (`greet("  Bob ")` → `"Hello, Bob!"`).
- AC#4: The binary, run with one argument, prints `greet(arg)` followed by a newline and exits 0.
- AC#5: The binary, run with no arguments, prints `greet("")` and exits 0.
- AC#6: `cargo test` passes and covers AC#1–AC#3; `cargo build` succeeds.

## Out of scope

- I18n, async, external crates beyond the standard library.

## Notes for the pipeline

- Verify lane(s): `unit` (cargo test).
