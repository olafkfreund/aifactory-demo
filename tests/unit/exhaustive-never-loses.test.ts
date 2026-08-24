// AC#4: Exhaustive proof it never loses — plays the AI against every possible
// opponent move sequence and asserts always draw or AI win, never a loss.
//
// The AI plays `bestMove` on every one of its turns; the adversary is allowed
// to play EVERY legal move at every one of its turns. We do this once with the
// AI moving first (as X) and once with the AI moving second (as O), so both
// perspectives are covered. Every reachable terminal must be a draw or an AI
// win. A single AI loss anywhere in the tree fails the test.
//
// The game module is a UMD/CommonJS module (games/tictactoe/game.js); there is
// no `app` JS package in this Python project, so it is imported by relative
// path — the only specifier that resolves.
import {
  newGame,
  move,
  bestMove,
  isGameOver,
} from "../../games/tictactoe/game.js";

type Player = "X" | "O";

interface GameState {
  board: (Player | null)[];
  currentPlayer: Player;
  winner: Player | null;
  winningLine: number[] | null;
  isDraw: boolean;
}

// Explore every game reachable when `aiPlayer` always plays the minimax move
// and the opponent is free to play any legal move. Collect every terminal
// state so the caller can assert over the full, exhaustive frontier.
function collectTerminals(
  state: GameState,
  aiPlayer: Player,
  terminals: GameState[],
): void {
  if (isGameOver(state)) {
    terminals.push(state);
    return;
  }

  if (state.currentPlayer === aiPlayer) {
    // AI's turn: it commits to exactly one move — the minimax-optimal one.
    const idx = bestMove(state) as number;
    collectTerminals(move(state, idx) as GameState, aiPlayer, terminals);
    return;
  }

  // Opponent's turn: branch on EVERY empty cell (every adversarial choice).
  for (let i = 0; i < 9; i++) {
    if (state.board[i] === null) {
      collectTerminals(move(state, i) as GameState, aiPlayer, terminals);
    }
  }
}

describe("AC#4: minimax AI never loses against any opponent sequence", () => {
  it.each<[Player, Player]>([
    ["X", "O"],
    ["O", "X"],
  ])(
    "AI as %s loses to no reachable opponent sequence",
    (aiPlayer, opponent) => {
      const terminals: GameState[] = [];
      collectTerminals(newGame() as GameState, aiPlayer, terminals);

      // Exhaustiveness sanity: the frontier is non-empty (the tree was walked).
      expect(terminals.length).toBeGreaterThan(0);

      // Every terminal is a draw or an AI win — the opponent never wins.
      const losses = terminals.filter((t) => t.winner === opponent);
      expect(losses).toEqual([]);
    },
  );

  it("every reachable terminal (AI as X) is a draw or an AI win", () => {
    const terminals: GameState[] = [];
    collectTerminals(newGame() as GameState, "X", terminals);

    const allDrawOrAiWin = terminals.every(
      (t) => t.isDraw || t.winner === "X",
    );
    expect(allDrawOrAiWin).toBe(true);
  });

  it("every reachable terminal (AI as O) is a draw or an AI win", () => {
    const terminals: GameState[] = [];
    collectTerminals(newGame() as GameState, "O", terminals);

    const allDrawOrAiWin = terminals.every(
      (t) => t.isDraw || t.winner === "O",
    );
    expect(allDrawOrAiWin).toBe(true);
  });
});
