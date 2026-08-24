// AC#2: Clicking an empty cell places the current player's mark and passes the turn.
// makeMove on an empty cell writes the current player's mark; updateGameState
// switches the turn X -> O.
import GameLogic from 'app/games/tictactoe/game';

describe('makeMove places mark and passes turn (AC#2)', () => {
  it('writes the current player mark X on an empty cell and returns true', () => {
    const game = GameLogic.createGame();

    const result = GameLogic.makeMove(game, 4);

    expect(result).toBe(true);
    expect(game.board[4]).toBe('X');
  });

  it('leaves other cells untouched when placing a mark', () => {
    const game = GameLogic.createGame();

    GameLogic.makeMove(game, 0);

    expect(game.board[0]).toBe('X');
    const others = game.board.filter((_: string | null, i: number) => i !== 0);
    expect(others.every((cell: string | null) => cell === null)).toBe(true);
  });

  it('passes the turn from X to O via updateGameState', () => {
    const game = GameLogic.createGame();

    GameLogic.makeMove(game, 0);
    const state = GameLogic.updateGameState(game);

    expect(state).toBe('continue');
    expect(game.currentPlayer).toBe('O');
  });

  it('lets O place its mark and passes the turn back to X', () => {
    const game = GameLogic.createGame();

    GameLogic.makeMove(game, 0);
    GameLogic.updateGameState(game); // X -> O
    const oResult = GameLogic.makeMove(game, 1);
    const state = GameLogic.updateGameState(game); // O -> X

    expect(oResult).toBe(true);
    expect(game.board[1]).toBe('O');
    expect(state).toBe('continue');
    expect(game.currentPlayer).toBe('X');
  });
});
