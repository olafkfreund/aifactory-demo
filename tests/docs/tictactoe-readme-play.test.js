// AC#1: README.md has a section 'Tic-tac-toe' that says how to open
// games/tictactoe/index.html and play.

const fs = require('fs');
const path = require('path');

function findReadme(startDir) {
  let dir = startDir;
  // Walk up the directory tree looking for a README.md at a repo root.
  for (let i = 0; i < 12; i++) {
    const candidate = path.join(dir, 'README.md');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

describe('README.md Tic-tac-toe section (AC#1)', () => {
  let readme;

  beforeAll(() => {
    const readmePath = findReadme(__dirname);
    expect(readmePath).not.toBeNull();
    readme = fs.readFileSync(readmePath, 'utf8');
  });

  it('contains a Tic-tac-toe section heading', () => {
    // A markdown heading line mentioning "Tic-tac-toe".
    expect(readme).toMatch(/^#{1,6}\s+.*tic-tac-toe/im);
  });

  it('tells the reader to open games/tictactoe/index.html', () => {
    expect(readme).toMatch(/games\/tictactoe\/index\.html/i);
  });

  it('explains how to play the game', () => {
    expect(readme).toMatch(/\bplay\b/i);
  });
});
