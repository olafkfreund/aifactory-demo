# Scenario — Go hello-world greeting library + CLI

A small **Go** module built into `scenarios/go-hello/` on branch
`bench/go-hello`, verified with `go test`.

## Goal

A reusable greeting package plus a thin CLI binary, idiomatic Go with table
tests — the Go counterpart to the Rust hello-world, to baseline
plan/code/verify on another compiled language.

## Scope

- A package function `Greet(name string) string` in package `greeting`.
- A `main` package (`cmd/greet/main.go`) that reads the first CLI arg and prints
  the greeting.
- A Go module (`go.mod`, `greeting/greeting.go`, `greeting/greeting_test.go`,
  `cmd/greet/main.go`) under the subdir.

## Acceptance Criteria

- AC#1: `Greet("World")` returns exactly `"Hello, World!"`.
- AC#2: `Greet("")` returns exactly `"Hello, stranger!"` (empty name → friendly default).
- AC#3: `Greet` trims surrounding whitespace from the name (`Greet("  Bob ")` → `"Hello, Bob!"`).
- AC#4: The binary, run with one argument, prints `Greet(arg)` followed by a newline and exits 0.
- AC#5: The binary, run with no arguments, prints `Greet("")` and exits 0.
- AC#6: `go test ./...` passes and covers AC#1–AC#3; `go build ./...` succeeds.

## Out of scope

- I18n, generics gymnastics, third-party modules beyond the standard library.

## Notes for the pipeline

- Verify lane(s): `unit` (go test).
