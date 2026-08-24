// Tic-tac-toe pure game logic.
//
// UMD-style wrapper so this file works two ways with zero build step:
//   - loaded as a plain <script> in the browser (exposes window.TicTacToe)
//   - required as a CommonJS module from Node's test runner
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.TicTacToe = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // Board positions are indices 0-8:
  //   0 | 1 | 2
  //   3 | 4 | 5
  //   6 | 7 | 8
  var WIN_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  function createEmptyBoard() {
    return [null, null, null, null, null, null, null, null, null];
  }

  // Returns { winner, line } for the first winning line found, or null.
  function getWinner(board) {
    for (var i = 0; i < WIN_LINES.length; i++) {
      var line = WIN_LINES[i];
      var a = board[line[0]];
      var b = board[line[1]];
      var c = board[line[2]];
      if (a && a === b && a === c) {
        return { winner: a, line: line };
      }
    }
    return null;
  }

  function isBoardFull(board) {
    for (var i = 0; i < board.length; i++) {
      if (board[i] === null) return false;
    }
    return true;
  }

  // Fresh game state: X moves first, nothing decided yet.
  function createGame() {
    return {
      board: createEmptyBoard(),
      current: "X",
      winner: null,
      line: null,
      over: false,
      draw: false,
    };
  }

  // Applies a move at `index` for the current player.
  // Returns a NEW state object. If the game is already over, or the cell
  // is occupied, or the index is out of range, the returned state has an
  // identical board/turn/outcome to the input (a no-op).
  function move(state, index) {
    if (state.over) return state;
    if (index < 0 || index > 8 || !Number.isInteger(index)) return state;
    if (state.board[index] !== null) return state;

    var board = state.board.slice();
    board[index] = state.current;

    var result = getWinner(board);
    if (result) {
      return {
        board: board,
        current: state.current,
        winner: result.winner,
        line: result.line,
        over: true,
        draw: false,
      };
    }

    if (isBoardFull(board)) {
      return {
        board: board,
        current: state.current,
        winner: null,
        line: null,
        over: true,
        draw: true,
      };
    }

    return {
      board: board,
      current: state.current === "X" ? "O" : "X",
      winner: null,
      line: null,
      over: false,
      draw: false,
    };
  }

  return {
    WIN_LINES: WIN_LINES,
    createEmptyBoard: createEmptyBoard,
    getWinner: getWinner,
    isBoardFull: isBoardFull,
    createGame: createGame,
    move: move,
  };
});
