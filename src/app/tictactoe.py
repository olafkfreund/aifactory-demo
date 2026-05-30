class TicTacToe:
    def __init__(self):
        self.board = [[' ' for _ in range(3)] for _ in range(3)]

    def move(self, row, col, player):
        if not (0 <= row < 3 and 0 <= col < 3):
            raise ValueError('Invalid move: out of bounds.')
        if self.board[row][col] != ' ':
            raise ValueError('Invalid move: cell already occupied.')
        self.board[row][col] = player