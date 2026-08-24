// AC#5: A full board with no winner reports a draw.
//
// This suite verifies GameLogic.isBoardFull is true on a completely filled
// board and that GameLogic.updateGameState returns 'draw', sets gameOver to
// true, and leaves winner null when the full board contains no winning line.
import GameLogic from 'app/games/tictactoe/game';

// A completely filled board that contains no winning line (classic draw):
//   X O X
//   X O O
//   O X X
const DRAW_BOARD = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];

function makeDrawState() {
  return {
    board: [...DRAW_BOARD],
    currentPlayer: 'X',
    winner: null,
    winningLine: null,
    gameOver: false,
  };
}

describe('AC#5: full board with no winner reports a draw', () => {
  it('isBoardFull is true for a completely filled board', () => {
    expect(GameLogic.isBoardFull(makeDrawState())).toBe(true);
  });

  it("updateGameState returns 'draw' on a full, winner-less board", () => {
    expect(GameLogic.updateGameState(makeDrawState())).toBe('draw');
  });

  it('updateGameState sets gameOver to true on a draw', () => {
    const state = makeDrawState();
    GameLogic.updateGameState(state);
    expect(state.gameOver).toBe(true);
  });

  it('updateGameState leaves winner null on a draw', () => {
    const state = makeDrawState();
    GameLogic.updateGameState(state);
    expect(state.winner).toBeNull();
  });

  it('a full board with no winning line has no winner reported by checkWinner', () => {
    expect(GameLogic.checkWinner(makeDrawState())).toBeNull();
  });
});
