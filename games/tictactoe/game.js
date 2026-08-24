// Pure tic-tac-toe game logic. No DOM, no I/O — safe to unit test directly
// and safe to load in a browser via a plain <script> tag (UMD-style export).
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.TicTacToe = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Index triples that constitute a win: 3 rows, 3 columns, 2 diagonals.
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

  // Fresh game state: empty board, X moves first, nothing decided yet.
  function newGame() {
    return {
      board: [null, null, null, null, null, null, null, null, null],
      currentPlayer: "X",
      winner: null,
      winningLine: null,
      isDraw: false,
    };
  }

  // Look for a completed line on the given board.
  // Returns { winner: 'X'|'O', line: [a,b,c] } or { winner: null, line: null }.
  function checkWinner(board) {
    for (var i = 0; i < WIN_LINES.length; i++) {
      var line = WIN_LINES[i];
      var a = line[0], b = line[1], c = line[2];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: line };
      }
    }
    return { winner: null, line: null };
  }

  function isBoardFull(board) {
    return board.every(function (cell) {
      return cell !== null;
    });
  }

  function isGameOver(state) {
    return state.winner !== null || state.isDraw;
  }

  // Given a focused cell index (0-8) and a keyboard key name, return the
  // index that keyboard focus should move to. Arrow keys move within the
  // 3x3 grid and wrap at the edges; Home/End jump to the first/last cell;
  // any other key leaves focus where it is.
  function nextFocusIndex(current, key) {
    var row = Math.floor(current / 3);
    var col = current % 3;
    switch (key) {
      case "ArrowRight":
        col = (col + 1) % 3;
        break;
      case "ArrowLeft":
        col = (col + 2) % 3;
        break;
      case "ArrowDown":
        row = (row + 1) % 3;
        break;
      case "ArrowUp":
        row = (row + 2) % 3;
        break;
      case "Home":
        return 0;
      case "End":
        return 8;
      default:
        return current;
    }
    return row * 3 + col;
  }

  // Apply a move at `index` to `state`, returning a NEW state.
  // If the game is already decided, the index is out of range, or the cell
  // is occupied, the original state object is returned unchanged (no-op).
  function move(state, index) {
    if (isGameOver(state)) return state;
    if (typeof index !== "number" || index < 0 || index > 8 || index % 1 !== 0) {
      return state;
    }
    if (state.board[index] !== null) return state;

    var board = state.board.slice();
    board[index] = state.currentPlayer;

    var result = checkWinner(board);
    var full = isBoardFull(board);

    return {
      board: board,
      currentPlayer: result.winner
        ? state.currentPlayer
        : state.currentPlayer === "X"
        ? "O"
        : "X",
      winner: result.winner,
      winningLine: result.line,
      isDraw: !result.winner && full,
    };
  }

  return {
    WIN_LINES: WIN_LINES,
    newGame: newGame,
    checkWinner: checkWinner,
    isBoardFull: isBoardFull,
    isGameOver: isGameOver,
    move: move,
    nextFocusIndex: nextFocusIndex,
  };
});
