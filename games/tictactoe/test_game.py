"""Comprehensive tests for Tic Tac Toe game logic"""
import sys
import os
import json

# Simple game logic implementation for testing
def create_game():
    """Create a new game state"""
    return {
        'board': [''] * 9,
        'current_player': 'X',
        'game_over': False,
        'winner': None,
        'winning_line': None
    }

WINNING_COMBINATIONS = [
    # Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    # Columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    # Diagonals
    [0, 4, 8],
    [2, 4, 6]
]

def is_valid_move(board, index):
    """Check if a position is valid and empty"""
    return 0 <= index < 9 and board[index] == ''

def check_winner(board):
    """Check for a winner"""
    for combination in WINNING_COMBINATIONS:
        a, b, c = combination
        if board[a] and board[a] == board[b] == board[c]:
            return {'winner': board[a], 'line': combination}
    return None

def is_board_full(board):
    """Check if the board is full"""
    return all(cell != '' for cell in board)

def is_draw(board):
    """Check if the game is a draw"""
    return is_board_full(board) and not check_winner(board)

def make_move(game, index):
    """Make a move on the board"""
    # If game is over or move is invalid, return unchanged
    if game['game_over'] or not is_valid_move(game['board'], index):
        return game

    # Create new board with the move
    new_board = game['board'][:]
    new_board[index] = game['current_player']

    # Check for winner
    winner_result = check_winner(new_board)
    if winner_result:
        return {
            'board': new_board,
            'current_player': game['current_player'],
            'game_over': True,
            'winner': winner_result['winner'],
            'winning_line': winner_result['line']
        }

    # Check for draw
    if is_board_full(new_board):
        return {
            'board': new_board,
            'current_player': game['current_player'],
            'game_over': True,
            'winner': None,
            'winning_line': None
        }

    # Switch player
    next_player = 'O' if game['current_player'] == 'X' else 'X'
    return {
        'board': new_board,
        'current_player': next_player,
        'game_over': False,
        'winner': None,
        'winning_line': None
    }

def reset_game():
    """Reset the game to initial state"""
    return create_game()


# ===== Tests =====

def test_create_game_initializes_empty_board():
    """createGame initializes empty board"""
    game = create_game()
    assert game['board'] == [''] * 9


def test_create_game_sets_current_player_to_x():
    """createGame sets current player to X"""
    game = create_game()
    assert game['current_player'] == 'X'


def test_create_game_sets_game_over_to_false():
    """createGame sets gameOver to false"""
    game = create_game()
    assert game['game_over'] == False


def test_create_game_sets_winner_to_none():
    """createGame sets winner to null"""
    game = create_game()
    assert game['winner'] is None


# ===== Valid Move Tests =====

def test_is_valid_move_returns_true_for_empty_cells():
    """isValidMove returns true for empty cells"""
    board = [''] * 9
    assert is_valid_move(board, 0) == True
    assert is_valid_move(board, 4) == True
    assert is_valid_move(board, 8) == True


def test_is_valid_move_returns_false_for_occupied_cells():
    """isValidMove returns false for occupied cells"""
    board = [''] * 9
    board[0] = 'X'
    board[4] = 'O'
    assert is_valid_move(board, 0) == False
    assert is_valid_move(board, 4) == False


def test_is_valid_move_returns_false_for_invalid_indices():
    """isValidMove returns false for invalid indices"""
    board = [''] * 9
    assert is_valid_move(board, -1) == False
    assert is_valid_move(board, 9) == False
    assert is_valid_move(board, 10) == False


# ===== Move Making Tests =====

def test_make_move_places_x_on_empty_cell():
    """makeMove places X on empty cell"""
    game = create_game()
    game = make_move(game, 0)
    assert game['board'][0] == 'X'


def test_make_move_switches_player_after_valid_move():
    """makeMove switches player after valid move"""
    game = create_game()
    game = make_move(game, 0)
    assert game['current_player'] == 'O'


def test_make_move_ignores_occupied_cell():
    """makeMove ignores occupied cell"""
    game = create_game()
    game = make_move(game, 0)  # X plays at 0
    board_before = game['board'][:]
    player_before = game['current_player']
    game = make_move(game, 0)  # Try to play at 0 again
    assert game['board'] == board_before
    assert game['current_player'] == player_before


def test_make_move_ignores_moves_after_game_over():
    """makeMove ignores moves after game over"""
    # Win scenario: X wins with top row
    game = create_game()
    game = make_move(game, 0)  # X: 0
    game = make_move(game, 3)  # O: 3
    game = make_move(game, 1)  # X: 1
    game = make_move(game, 4)  # O: 4
    game = make_move(game, 2)  # X: 2 (X wins)
    assert game['game_over'] == True

    board_before = game['board'][:]
    game = make_move(game, 5)  # Try to move after game over
    assert game['board'] == board_before


# ===== Winning Line Tests =====

def test_row_0_winning_line():
    """Row 0 (0, 1, 2) detected as winning line"""
    board = ['X', 'X', 'X', '', '', '', '', '', '']
    result = check_winner(board)
    assert result['winner'] == 'X'
    assert result['line'] == [0, 1, 2]


def test_row_1_winning_line():
    """Row 1 (3, 4, 5) detected as winning line"""
    board = ['', '', '', 'O', 'O', 'O', '', '', '']
    result = check_winner(board)
    assert result['winner'] == 'O'
    assert result['line'] == [3, 4, 5]


def test_row_2_winning_line():
    """Row 2 (6, 7, 8) detected as winning line"""
    board = ['', '', '', '', '', '', 'X', 'X', 'X']
    result = check_winner(board)
    assert result['winner'] == 'X'
    assert result['line'] == [6, 7, 8]


def test_column_0_winning_line():
    """Column 0 (0, 3, 6) detected as winning line"""
    board = ['X', '', '', 'X', '', '', 'X', '', '']
    result = check_winner(board)
    assert result['winner'] == 'X'
    assert result['line'] == [0, 3, 6]


def test_column_1_winning_line():
    """Column 1 (1, 4, 7) detected as winning line"""
    board = ['', 'O', '', '', 'O', '', '', 'O', '']
    result = check_winner(board)
    assert result['winner'] == 'O'
    assert result['line'] == [1, 4, 7]


def test_column_2_winning_line():
    """Column 2 (2, 5, 8) detected as winning line"""
    board = ['', '', 'X', '', '', 'X', '', '', 'X']
    result = check_winner(board)
    assert result['winner'] == 'X'
    assert result['line'] == [2, 5, 8]


def test_diagonal_1_winning_line():
    """Diagonal 1 (0, 4, 8) detected as winning line"""
    board = ['O', '', '', '', 'O', '', '', '', 'O']
    result = check_winner(board)
    assert result['winner'] == 'O'
    assert result['line'] == [0, 4, 8]


def test_diagonal_2_winning_line():
    """Diagonal 2 (2, 4, 6) detected as winning line"""
    board = ['', '', 'X', '', 'X', '', 'X', '', '']
    result = check_winner(board)
    assert result['winner'] == 'X'
    assert result['line'] == [2, 4, 6]


def test_no_winner_returns_none():
    """No winner returns null"""
    board = ['X', 'O', '', '', '', '', '', '', '']
    result = check_winner(board)
    assert result is None


# ===== Game End Tests =====

def test_draw_is_detected():
    """Draw is detected when board is full with no winner"""
    board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']
    assert is_draw(board) == True


def test_is_board_full_for_full_board():
    """isBoardFull returns true for full board"""
    board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']
    assert is_board_full(board) == True


def test_is_board_full_for_partial_board():
    """isBoardFull returns false for partial board"""
    board = ['X', '', '', '', '', '', '', '', '']
    assert is_board_full(board) == False


def test_game_ends_on_winner_detection():
    """Game ends on winner detection"""
    game = create_game()
    game = make_move(game, 0)  # X: 0
    game = make_move(game, 3)  # O: 3
    game = make_move(game, 1)  # X: 1
    game = make_move(game, 4)  # O: 4
    game = make_move(game, 2)  # X: 2 (X wins)
    assert game['game_over'] == True
    assert game['winner'] == 'X'


def test_game_ends_on_draw():
    """Game ends on draw"""
    # Create a draw scenario
    game = create_game()
    game = make_move(game, 0)  # X: 0
    game = make_move(game, 1)  # O: 1
    game = make_move(game, 2)  # X: 2
    game = make_move(game, 3)  # O: 3
    game = make_move(game, 5)  # X: 5
    game = make_move(game, 4)  # O: 4
    game = make_move(game, 6)  # X: 6
    game = make_move(game, 8)  # O: 8
    game = make_move(game, 7)  # X: 7 (board full, no winner)
    assert game['game_over'] == True
    assert game['winner'] is None


# ===== Reset Game Tests =====

def test_reset_game_returns_to_initial_state():
    """resetGame returns to initial state"""
    game = create_game()
    game = make_move(game, 0)
    game = make_move(game, 1)
    game = reset_game()

    initial_game = create_game()
    assert game == initial_game


def test_reset_game_clears_board():
    """resetGame clears board after moves"""
    game = create_game()
    game = make_move(game, 0)
    game = make_move(game, 1)
    game = reset_game()

    assert game['board'] == [''] * 9


# ===== Complex Game Scenario Tests =====

def test_complex_game_x_wins_row_1():
    """Complex game scenario: X wins row 1"""
    game = create_game()
    game = make_move(game, 3)  # X: 3
    game = make_move(game, 0)  # O: 0
    game = make_move(game, 4)  # X: 4
    game = make_move(game, 1)  # O: 1
    game = make_move(game, 5)  # X: 5 (X wins row 1)

    assert game['game_over'] == True
    assert game['winner'] == 'X'
    assert game['winning_line'] == [3, 4, 5]


def test_complex_game_o_wins_column():
    """Complex game scenario: O wins column"""
    game = create_game()
    game = make_move(game, 0)  # X: 0
    game = make_move(game, 1)  # O: 1
    game = make_move(game, 2)  # X: 2
    game = make_move(game, 4)  # O: 4
    game = make_move(game, 3)  # X: 3
    game = make_move(game, 7)  # O: 7 (O wins column 1)

    assert game['game_over'] == True
    assert game['winner'] == 'O'
    assert game['winning_line'] == [1, 4, 7]
