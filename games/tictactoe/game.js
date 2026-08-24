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

  // Order candidate moves so that, among equally-good options, the centre
  // is preferred over corners, which are preferred over edges. This gives
  // deterministic, intuitively-strong play (e.g. taking the centre on an
  // empty board) without changing the minimax-optimal value of any move.
  var MOVE_PREFERENCE = [4, 0, 2, 6, 8, 1, 3, 5, 7];

  // Score a terminal state from `aiPlayer`'s point of view. Wins closer to
  // the present (smaller depth) score higher/lower so the AI prefers the
  // fastest win and the slowest loss.
  function terminalScore(state, aiPlayer, depth) {
    if (state.winner === aiPlayer) return 10 - depth;
    if (state.winner) return depth - 10;
    return 0;
  }

  // Minimax over the (tiny, <=9-ply) game tree. Returns the value of
  // `state` from `aiPlayer`'s perspective, assuming both sides play
  // optimally from here on.
  function minimax(state, aiPlayer, depth) {
    if (isGameOver(state)) return terminalScore(state, aiPlayer, depth);

    var maximizing = state.currentPlayer === aiPlayer;
    var best = maximizing ? -Infinity : Infinity;

    for (var i = 0; i < MOVE_PREFERENCE.length; i++) {
      var idx = MOVE_PREFERENCE[i];
      if (state.board[idx] !== null) continue;
      var score = minimax(move(state, idx), aiPlayer, depth + 1);
      if (maximizing) {
        if (score > best) best = score;
      } else {
        if (score < best) best = score;
      }
    }

    return best;
  }

  // Return the minimax-optimal move index for the player to move in
  // `state`, or null if the game is already over. Never loses: at worst it
  // forces a draw against any opponent play.
  function bestMove(state) {
    if (isGameOver(state)) return null;

    var player = state.currentPlayer;
    var bestIndex = null;
    var bestScore = -Infinity;

    for (var i = 0; i < MOVE_PREFERENCE.length; i++) {
      var idx = MOVE_PREFERENCE[i];
      if (state.board[idx] !== null) continue;
      var score = minimax(move(state, idx), player, 1);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = idx;
      }
    }

    return bestIndex;
  }

  return {
    WIN_LINES: WIN_LINES,
    newGame: newGame,
    checkWinner: checkWinner,
    isBoardFull: isBoardFull,
    isGameOver: isGameOver,
    move: move,
    bestMove: bestMove,
  };
});
