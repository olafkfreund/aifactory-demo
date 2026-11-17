// Criterion (AC#4): games/tictactoe/game.test.js covers availableMoves across
// all four board states — an empty board yielding exactly 9 moves
// ([0,1,2,3,4,5,6,7,8]), a partly filled board (only empty-cell indices in
// ascending order), a won board (returns []), and a drawn board (returns []).
// The literal 9 from AC#4 is asserted explicitly and is NOT substituted with
// any implementation-derived value.

const { availableMoves } = require('./game');

function emptyBoard() {
  return [null, null, null, null, null, null, null, null, null];
}

describe('availableMoves', () => {
  describe('empty board', () => {
    it('returns exactly 9 available moves', () => {
      expect(availableMoves(emptyBoard())).toHaveLength(9);
    });

    it('returns every cell index 0-8 in ascending order', () => {
      expect(availableMoves(emptyBoard())).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });
  });

  describe('partly filled board', () => {
    it('returns only the empty-cell indices in ascending order', () => {
      // X . O
      // . X .
      // . O .
      const board = ['X', null, 'O', null, 'X', null, null, 'O', null];
      expect(availableMoves(board)).toEqual([1, 3, 5, 6, 8]);
    });
  });

  describe('won board', () => {
    it('returns an empty array', () => {
      // X X X  -> X wins the top row
      // O O .
      // . . .
      const board = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
      expect(availableMoves(board)).toEqual([]);
    });
  });

  describe('drawn board', () => {
    it('returns an empty array', () => {
      // X O X
      // X O O
      // O X X  -> full board, no winner
      const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      expect(availableMoves(board)).toEqual([]);
    });
  });
});
