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

  function other(player) {
    return player === "X" ? "O" : "X";
  }

  function filledCount(board) {
    var count = 0;
    for (var i = 0; i < 9; i++) {
      if (board[i] !== null) count++;
    }
    return count;
  }

  // Cache of minimax scores keyed by "board|playerToMove|aiPlayer". Board
  // states recur often via different move orders (transpositions), so this
  // cache keeps the exhaustive search below fast without changing results.
  // Depth is derived from the board itself (its filled-cell count), so a
  // cached value is exact and safe to reuse from any call site.
  var minimaxCache = new Map();

  // Score `board` from `aiPlayer`'s perspective, assuming both sides play
  // perfectly from here on. `player` is whose turn it is to move.
  // +10/-10 (scaled by how many moves it took, so faster wins and slower
  // losses are preferred), 0 for a drawn outcome.
  function minimax(board, player, aiPlayer) {
    var result = checkWinner(board);
    if (result.winner === aiPlayer) return 10 - filledCount(board);
    if (result.winner === other(aiPlayer)) return filledCount(board) - 10;
    if (isBoardFull(board)) return 0;

    var key = board.join(",") + "|" + player + "|" + aiPlayer;
    if (minimaxCache.has(key)) return minimaxCache.get(key);

    var maximizing = player === aiPlayer;
    var best = maximizing ? -Infinity : Infinity;

    for (var i = 0; i < 9; i++) {
      if (board[i] !== null) continue;
      board[i] = player;
      var score = minimax(board, other(player), aiPlayer);
      board[i] = null;

      if (maximizing ? score > best : score < best) {
        best = score;
      }
    }

    minimaxCache.set(key, best);
    return best;
  }

  // Return the index of an optimal move for the player to move in `state`,
  // or null if the game is already over. Never picks a move that lets a
  // perfectly-playing opponent win.
  function bestMove(state) {
    if (state.winner !== null || state.isDraw) return null;

    var board = state.board.slice();
    var aiPlayer = state.currentPlayer;

    var emptyCells = [];
    for (var i = 0; i < 9; i++) {
      if (board[i] === null) emptyCells.push(i);
    }

    // Opening move on an empty board: every cell scores equal (a perfectly
    // played game is a draw), so break the tie in favour of the centre.
    if (emptyCells.length === 9) return 4;

    var bestScore = -Infinity;
    var bestIndex = emptyCells[0];

    for (var j = 0; j < emptyCells.length; j++) {
      var index = emptyCells[j];
      board[index] = aiPlayer;
      var score = minimax(board, other(aiPlayer), aiPlayer);
      board[index] = null;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    }

    return bestIndex;
  }

  // Given a focused cell index (0-8) and a keyboard key name, return the
  // index the grid focus should move to. Arrow keys move within the row/
  // column and wrap at the edges; Home/End jump to the first/last cell;
  // any other key leaves the focus where it is.
  function nextFocusIndex(current, key) {
    var row = Math.floor(current / 3);
    var col = current % 3;

    switch (key) {
      case "ArrowRight":
        return row * 3 + ((col + 1) % 3);
      case "ArrowLeft":
        return row * 3 + ((col + 2) % 3);
      case "ArrowDown":
        return ((row + 1) % 3) * 3 + col;
      case "ArrowUp":
        return ((row + 2) % 3) * 3 + col;
      case "Home":
        return 0;
      case "End":
        return 8;
      default:
        return current;
    }
  }

  var api = {
    WIN_LINES: WIN_LINES,
    createGame: createGame,
    checkWinner: checkWinner,
    isBoardFull: isBoardFull,
    makeMove: makeMove,
    bestMove: bestMove,
    nextFocusIndex: nextFocusIndex,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.TicTacToe = api;
  }
})(typeof window !== "undefined" ? window : this);
