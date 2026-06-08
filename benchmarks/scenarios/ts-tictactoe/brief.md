# Scenario 3 — TypeScript console Tic-Tac-Toe

A **TypeScript / Node** console Tic-Tac-Toe built into `scenarios/ts-tictactoe/`
on branch `bench/ts-tictactoe`, verified with **vitest**.

> Swapped from the originally-requested Go implementation: TFactory has no Go
> test-generation framework, but full vitest/jest support — so this scenario can
> complete the full plan→code→verify loop. The game logic is identical in spirit.

## Goal

A pure, well-tested game-logic module plus a thin console UI, so the engine is
fully unit-testable independent of stdin/stdout.

## Scope

- A pure `Board`/engine module: place marks, detect win/draw, reject invalid moves.
- A console runner (`main.ts`) that alternates X/O from stdin — thin, untested glue.
- A Node + TypeScript project (`package.json`, `tsconfig.json`, `vitest` config) under the subdir.

## Acceptance Criteria

- AC#1: A fresh 3×3 board reports status `in_progress` and no winner.
- AC#2: Placing a mark on an occupied or out-of-range cell throws / returns an error (move rejected, board unchanged).
- AC#3: Three of the same mark in any row, column, or either diagonal is detected as a win for that mark.
- AC#4: A full board with no three-in-a-row is detected as a `draw`.
- AC#5: Players alternate X then O; the engine rejects a move by the wrong player when turn order is enforced.
- AC#6: `vitest run` passes and covers AC#1–AC#5; `tsc --noEmit` typechecks clean.

## Out of scope

- AI opponent, networking, graphics.

## Notes for the pipeline

- Verify lane(s): `unit` (vitest).
- Keep all game rules in the pure engine module so they're unit-testable without the console I/O.
