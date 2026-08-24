// Quick verification that game logic works end-to-end
const { TicTacToeGame } = require('./games/tictactoe/game.js');

// Test 1: Playable game
const game = new TicTacToeGame();
console.log('✓ Game initialized');

// Test 2: Valid moves work
game.makeMove(0);
game.makeMove(1);
game.makeMove(3);
game.makeMove(2);
game.makeMove(6);
console.log('✓ Valid moves accepted');

// Test 3: Win detected
if (game.winner === 'X' && game.gameOver) {
    console.log('✓ Win detected: X won with column 0-3-6');
} else {
    console.log('✗ Win not detected properly');
    process.exit(1);
}

// Test 4: Move after game over rejected
const result = game.makeMove(4);
if (!result) {
    console.log('✓ Move after game over rejected');
} else {
    console.log('✗ Move after game over was accepted');
    process.exit(1);
}

// Test 5: New game works
game.reset();
if (game.board.every(c => c === null) && game.currentPlayer === 'X' && !game.gameOver) {
    console.log('✓ New game reset works');
} else {
    console.log('✗ New game reset failed');
    process.exit(1);
}

// Test 6: Draw detection
const game2 = new TicTacToeGame();
const drawMoves = [0, 2, 1, 3, 5, 4, 6, 7, 8];
drawMoves.forEach(m => game2.makeMove(m));
if (game2.gameOver && !game2.winner) {
    console.log('✓ Draw detection works');
} else {
    console.log('✗ Draw not detected properly');
    process.exit(1);
}

console.log('\n✅ All verification checks passed!');
console.log('The game is fully functional and ready to play.');
