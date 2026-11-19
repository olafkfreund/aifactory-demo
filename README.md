# aifactory-demo

A tiny FastAPI service used as the demo target for [AIFactory](https://github.com/olafkfreund/AIFactory).

The `scripts/demo.sh` script in the AIFactory repo seeds this repo with 3 GitHub issues (resetting it to a known state each run), imports them into a local AIFactory portal as backlog tasks, and walks through the Claude → portal → agent end-to-end flow.

## What this app does

It's intentionally minimal — a single FastAPI route at `/` returning JSON.

```bash
pip install -e .
uvicorn src.app.main:app --reload
curl http://localhost:8000/
# {"app":"aifactory-demo"}
```

## Why FastAPI

AIFactory's own backend uses FastAPI, so the AI agents are familiar with the framework. The demo issues exercise the planner→coder→QA loop against routine FastAPI work (add an endpoint, add a test, fix a small bug).

## Issues the demo seeds

`scripts/demo.sh` opens these on each run:

1. **Add `/healthz` endpoint** — returns `{"status":"ok"}` + HTTP 200
2. **Document the Quick Start in README** — three-command run guide
3. **Add `/version` endpoint with tests** — reads `__version__` from `src/app/__init__.py`

Issues are closed at the start of each demo run, then re-created fresh.

## Tic-tac-toe

A classic tic-tac-toe game with keyboard navigation and an unbeatable AI opponent.

### How to play

Open `games/tictactoe/index.html` in your browser to play. Click on cells to place your mark (X), or use arrow keys to navigate and Enter/Space to place. Check the "Play vs Computer" checkbox to face off against an AI opponent.

### Game logic

The game logic is in `games/tictactoe/game.js` and exports the following functions:

- `emptyBoard()` — Returns a fresh 9-cell board
- `move(board, index, player)` — Places a player's mark and returns a new board
- `winner(board)` — Returns "X", "O", "draw", or null
- `winningLine(board)` — Returns the three indices of a winning line or null
- `nextFocusIndex(current, key)` — Returns the next focus index for keyboard navigation
- `bestMove(board, player)` — Returns the best move for a player using minimax search
- `WIN_LINES` — The 8 winning line combinations (3 rows, 3 columns, 2 diagonals)

### Running tests

Run the game's tests with:

```bash
npx jest
```
