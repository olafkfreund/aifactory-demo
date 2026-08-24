// Pure Tic-Tac-Toe game engine — no DOM, no I/O.
// Works both as a browser <script> (exposes window.TicTacToe) and as a
// CommonJS module for Node's test runner (module.exports).
(function (root) {
  "use strict";

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

  // Fresh game state: empty board, X to move, no winner, not a draw.
  function createGame() {
    return {
      board: new Array(9).fill(null),
      currentPlayer: "X",
      winner: null,
      winningLine: null,
      isDraw: false,
    };
  }

  // Inspect a board and report a winner (mark + line) if one exists.
  function checkWinner(board) {
    for (var i = 0; i < WIN_LINES.length; i++) {
      var line = WIN_LINES[i];
      var a = board[line[0]];
      var b = board[line[1]];
      var c = board[line[2]];
      if (a && a === b && a === c) {
        return { winner: a, line: line };
      }
    }
    return { winner: null, line: null };
  }

  function isBoardFull(board) {
    return board.every(function (cell) {
      return cell !== null;
    });
  }

  // Attempt to place the current player's mark at `index`.
  // Returns a NEW state. Invalid moves (occupied cell, out-of-range
  // index, or game already decided) are a no-op: the returned state is
  // equal in value to the input state, and the turn does not pass.
  function makeMove(state, index) {
    var isValidIndex = Number.isInteger(index) && index >= 0 && index <= 8;
    var isGameOver = state.winner !== null || state.isDraw;

    if (!isValidIndex || isGameOver || state.board[index] !== null) {
      return state;
    }

    var board = state.board.slice();
    board[index] = state.currentPlayer;

    var result = checkWinner(board);
    var full = isBoardFull(board);

    return {
      board: board,
      currentPlayer: state.currentPlayer === "X" ? "O" : "X",
      winner: result.winner,
      winningLine: result.line,
      isDraw: result.winner === null && full,
    };
  }

  var api = {
    WIN_LINES: WIN_LINES,
    createGame: createGame,
    checkWinner: checkWinner,
    isBoardFull: isBoardFull,
    makeMove: makeMove,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.TicTacToe = api;
  }
})(typeof window !== "undefined" ? window : this);
