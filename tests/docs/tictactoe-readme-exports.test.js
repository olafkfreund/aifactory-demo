// AC#2: The README Tic-tac-toe "Game logic" section lists the exported rule
// functions in games/tictactoe/game.js — namely emptyBoard, move, winner,
// winningLine, nextFocusIndex, bestMove, and WIN_LINES.

const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '..', '..', 'README.md');

const EXPORTED_NAMES = [
  'emptyBoard',
  'move',
  'winner',
  'winningLine',
  'nextFocusIndex',
  'bestMove',
  'WIN_LINES',
];

/**
 * Extract the body of the "Game logic" section from the README. The section
 * starts at a heading whose text is "Game logic" and runs until the next
 * heading of the same or higher level (or end of file).
 */
function extractGameLogicSection(markdown) {
  const lines = markdown.split('\n');
  let startIndex = -1;
  let headingLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const match = /^(#{1,6})\s+(.*\S)\s*$/.exec(lines[i]);
    if (match && match[2].trim().toLowerCase() === 'game logic') {
      startIndex = i + 1;
      headingLevel = match[1].length;
      break;
    }
  }

  if (startIndex === -1) {
    return null;
  }

  const body = [];
  for (let i = startIndex; i < lines.length; i++) {
    const match = /^(#{1,6})\s+/.exec(lines[i]);
    if (match && match[1].length <= headingLevel) {
      break;
    }
    body.push(lines[i]);
  }

  return body.join('\n');
}

describe('README Tic-tac-toe "Game logic" section', () => {
  let section;

  beforeAll(() => {
    const markdown = fs.readFileSync(README_PATH, 'utf8');
    section = extractGameLogicSection(markdown);
  });

  it('has a "Game logic" section', () => {
    expect(section).not.toBeNull();
  });

  it.each(EXPORTED_NAMES)(
    'names the exported rule function %s',
    (name) => {
      expect(section).toContain(name);
    }
  );
});
