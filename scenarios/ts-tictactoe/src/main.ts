/**
 * Browser entry point: binds the pure `Game` controller to the DOM.
 *
 * This is the only module that touches the document. It renders the 3x3 grid,
 * keeps the status line in sync (turn / winner / draw), wires up the mode
 * toggle (switching mode starts a fresh game) and the "New game" button, and
 * forwards cell clicks to the controller. All game logic lives in `./game`,
 * `./engine` and `./ai`; this file is thin, untested glue.
 */

import { Game, Mode } from './game';
import { Status } from './engine';

/** Look up a required element by id, throwing if the markup is missing it. */
function requireElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (el === null) {
    throw new Error(`Missing required element: #${id}`);
  }
  return el as T;
}

const statusEl = requireElement<HTMLParagraphElement>('status');
const boardEl = requireElement<HTMLDivElement>('board');
const modeToggleEl = requireElement<HTMLInputElement>('mode-toggle');
const newGameEl = requireElement<HTMLButtonElement>('new-game');

const cells = Array.from(
  boardEl.querySelectorAll<HTMLButtonElement>('.cell'),
);

/** Translate the toggle's checked state into a game mode. */
function modeFromToggle(): Mode {
  return modeToggleEl.checked ? 'vs-ai' : 'two-player';
}

const game = new Game(modeFromToggle());

/** Human-readable marks for each cell (empty cells show nothing). */
const MARK: Record<string, string> = { X: 'X', O: 'O' };

/** Build the status line for the current state. */
function statusMessage(status: Status, currentPlayer: string): string {
  switch (status) {
    case 'x_win':
      return 'X wins!';
    case 'o_win':
      return 'O wins!';
    case 'draw':
      return "It's a draw.";
    default:
      return `${currentPlayer} to move`;
  }
}

/** Reflect the controller's current state onto the DOM. */
function render(): void {
  const state = game.getState();

  cells.forEach((cell, index) => {
    const mark = state.board[index];
    cell.textContent = mark === null ? '' : MARK[mark];
    // Disable a cell once it is filled or the game has ended.
    cell.disabled = mark !== null || state.isOver;
  });

  statusEl.textContent = statusMessage(state.status, state.currentPlayer);
}

/** Handle a click on a board cell. */
function onCellClick(index: number): void {
  game.handleCellClick(index);
  render();
}

/** Start a fresh game in the mode currently selected by the toggle. */
function startNewGame(): void {
  game.newGame(modeFromToggle());
  render();
}

cells.forEach((cell, index) => {
  cell.addEventListener('click', () => onCellClick(index));
});

modeToggleEl.addEventListener('change', startNewGame);
newGameEl.addEventListener('click', startNewGame);

render();
