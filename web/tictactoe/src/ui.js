// DOM wiring for the Tic Tac Toe game.
//
// This layer is intentionally thin: it owns only the board state and the
// browser event handling. All game rules live in engine.js.

import { emptyBoard, applyMove, status, bestMove } from './engine.js';

/** The human always plays X; the computer plays O. */
const HUMAN = 'X';
const COMPUTER = 'O';

let board = emptyBoard();
let turn = HUMAN;

const cellEls = Array.from(document.querySelectorAll('[data-cell]'));
const statusEl = document.querySelector('[data-status]');
const resetEl = document.querySelector('[data-reset]');
const toggleEl = document.querySelector('[data-vs-computer]');

/** Render the current board and status text into the DOM. */
function render() {
  cellEls.forEach((el, index) => {
    el.textContent = board[index];
    el.disabled = board[index] !== '' || status(board) !== 'in_progress';
  });

  const state = status(board);
  if (state === 'in_progress') {
    statusEl.textContent = `${turn} to move`;
  } else if (state === 'draw') {
    statusEl.textContent = 'Draw';
  } else {
    statusEl.textContent = `${state} wins`;
  }
}

/** Whether the game is still playable. */
function inProgress() {
  return status(board) === 'in_progress';
}

/** Switch the active player. */
function swapTurn() {
  turn = turn === 'X' ? 'O' : 'X';
}

/** Let the computer take its move, if it is enabled and its turn. */
function computerMove() {
  if (!toggleEl.checked || !inProgress() || turn !== COMPUTER) return;
  const move = bestMove(board, COMPUTER);
  if (move === null) return;
  board = applyMove(board, move, COMPUTER);
  swapTurn();
}

/** Handle a click on the cell at `index`. */
function handleCellClick(index) {
  if (!inProgress() || board[index] !== '') return;

  board = applyMove(board, index, turn);
  swapTurn();

  computerMove();
  render();
}

/** Clear the board and start a fresh game. */
function reset() {
  board = emptyBoard();
  turn = HUMAN;
  render();
}

cellEls.forEach((el, index) => {
  el.addEventListener('click', () => handleCellClick(index));
});
resetEl.addEventListener('click', reset);
toggleEl.addEventListener('change', reset);

render();
