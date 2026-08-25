// Pure tic-tac-toe rules. No DOM, no I/O — safe to unit test directly and
// safe to load in a browser via a plain <script> tag (UMD-style export).
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

  // A fresh 9-cell board: every cell empty (null).
  function emptyBoard() {
    return [null, null, null, null, null, null, null, null, null];
  }

  // The three indices of a completed line, or null if no line is complete.
  function winningLine(board) {
    for (var i = 0; i < WIN_LINES.length; i++) {
      var line = WIN_LINES[i];
      var a = line[0], b = line[1], c = line[2];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return line;
      }
    }
    return null;
  }

  // "X" | "O" | "draw" | null (null means play continues).
  function winner(board) {
    var line = winningLine(board);
    if (line) return board[line[0]];
    return board.every(function (cell) { return cell !== null; }) ? "draw" : null;
  }

  // Place `player`'s mark at `index`, returning a NEW board. Returns the
  // original board unchanged (no-op) if the game is already decided, the
  // index is out of range, or the cell is already occupied.
  function move(board, index, player) {
    if (winner(board) !== null) return board;
    if (typeof index !== "number" || index < 0 || index > 8 || index % 1 !== 0) {
      return board;
    }
    if (board[index] !== null) return board;

    var next = board.slice();
    next[index] = player;
    return next;
  }

  return {
    emptyBoard: emptyBoard,
    move: move,
    winner: winner,
    winningLine: winningLine,
  };
});
