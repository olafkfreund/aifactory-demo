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

  // A fresh, empty 9-cell board.
  function emptyBoard() {
    return [null, null, null, null, null, null, null, null, null];
  }

  // The three indices that make up a completed line, or null if there
  // isn't one.
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

  // "X" or "O" if that player has completed a line, "draw" if the board is
  // full with no winner, or null if play continues.
  function winner(board) {
    var line = winningLine(board);
    if (line) return board[line[0]];
    for (var i = 0; i < board.length; i++) {
      if (board[i] === null) return null;
    }
    return "draw";
  }

  // Place `player`'s mark at `index`, returning a NEW board. Returns the
  // original board unchanged (no-op) if the game is already decided, the
  // index is out of range, or the cell is occupied.
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

  // --- UI-facing helpers built on top of the pure board API above ---

  // Fresh game state: empty board, X moves first.
  function newGame() {
    return { board: emptyBoard(), currentPlayer: "X" };
  }

  function isGameOver(state) {
    return winner(state.board) !== null;
  }

  // Apply a move at `index` for the state's current player, returning a NEW
  // state with the turn passed. Returns the original state unchanged if the
  // move is rejected (occupied cell, game already over, bad index).
  function applyMove(state, index) {
    var board = move(state.board, index, state.currentPlayer);
    if (board === state.board) return state;
    return {
      board: board,
      currentPlayer: state.currentPlayer === "X" ? "O" : "X",
    };
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

  // Slight preference among equally-good (by minimax score) moves: centre
  // over corners over edges. This only breaks ties — it never overrides a
  // strictly better minimax score — but it's what makes the AI open an
  // empty board by taking the centre instead of an arbitrary first cell.
  function positionWeight(index) {
    if (index === 4) return 3;
    if (index === 0 || index === 2 || index === 6 || index === 8) return 2;
    return 1;
  }

  // Minimax search with alpha-beta pruning. Returns the value of `board`
  // (with `player` to move) from the perspective of `aiPlayer`: positive
  // means aiPlayer is winning, negative means aiPlayer is losing, 0 is a
  // draw. Faster wins and slower losses are preferred via the depth term,
  // so the AI plays the fastest available win and delays an unavoidable
  // loss as long as possible.
  function minimax(board, player, aiPlayer, depth, alpha, beta) {
    var result = winner(board);
    if (result === aiPlayer) return 10 - depth;
    if (result === "draw") return 0;
    if (result) return depth - 10;

    var opponent = player === "X" ? "O" : "X";
    var maximizing = player === aiPlayer;
    var value = maximizing ? -Infinity : Infinity;
    for (var i = 0; i < 9; i++) {
      if (board[i] !== null) continue;
      var score = minimax(move(board, i, player), opponent, aiPlayer, depth + 1, alpha, beta);
      if (maximizing) {
        if (score > value) value = score;
        if (value > alpha) alpha = value;
      } else {
        if (score < value) value = score;
        if (value < beta) beta = value;
      }
      if (beta <= alpha) break;
    }
    return value;
  }

  // Returns the index of the best available move for `player` on `board`,
  // using exhaustive minimax search — this player never loses. Returns
  // null if the game is already decided.
  function bestMove(board, player) {
    if (winner(board) !== null) return null;

    var opponent = player === "X" ? "O" : "X";
    var bestIndex = null;
    var bestValue = -Infinity;
    for (var i = 0; i < 9; i++) {
      if (board[i] !== null) continue;
      var score = minimax(move(board, i, player), opponent, player, 1, -Infinity, Infinity);
      var weighted = score + 0.01 * positionWeight(i);
      if (weighted > bestValue) {
        bestValue = weighted;
        bestIndex = i;
      }
    }
    return bestIndex;
  }

  return {
    WIN_LINES: WIN_LINES,
    emptyBoard: emptyBoard,
    move: move,
    winner: winner,
    winningLine: winningLine,
    newGame: newGame,
    isGameOver: isGameOver,
    applyMove: applyMove,
    nextFocusIndex: nextFocusIndex,
    bestMove: bestMove,
  };
});
