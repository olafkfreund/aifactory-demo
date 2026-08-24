/**
 * AC#1-6: nextFocusIndex(current, key) — given a cell index 0-8 and a key name,
 *   moves right/left within a row and up/down within a column
 *     (from 4: ArrowRight->5, ArrowLeft->3, ArrowUp->1, ArrowDown->7),
 *   wraps at the edges
 *     (from 2 ArrowRight->0, from 0 ArrowLeft->2, from 0 ArrowUp->6, from 6 ArrowDown->0),
 *   returns 0 for Home and 8 for End from any cell,
 *   returns the current index unchanged for any other key,
 *   and this suite passes under `npx jest`.
 *
 * The module under test exports for Node/Jest via CommonJS, so it is required
 * by its co-located relative path (matching the module's own export contract).
 */
const { nextFocusIndex } = require('./game');

describe('nextFocusIndex', () => {
  describe('AC#2: moves within a row/column from the centre cell (4)', () => {
    test('from 4, ArrowRight is 5', () => {
      expect(nextFocusIndex(4, 'ArrowRight')).toBe(5);
    });

    test('from 4, ArrowLeft is 3', () => {
      expect(nextFocusIndex(4, 'ArrowLeft')).toBe(3);
    });

    test('from 4, ArrowUp is 1', () => {
      expect(nextFocusIndex(4, 'ArrowUp')).toBe(1);
    });

    test('from 4, ArrowDown is 7', () => {
      expect(nextFocusIndex(4, 'ArrowDown')).toBe(7);
    });
  });

  describe('AC#3: wraps at the edges', () => {
    test('from 2, ArrowRight wraps to 0', () => {
      expect(nextFocusIndex(2, 'ArrowRight')).toBe(0);
    });

    test('from 0, ArrowLeft wraps to 2', () => {
      expect(nextFocusIndex(0, 'ArrowLeft')).toBe(2);
    });

    test('from 0, ArrowUp wraps to 6', () => {
      expect(nextFocusIndex(0, 'ArrowUp')).toBe(6);
    });

    test('from 6, ArrowDown wraps to 0', () => {
      expect(nextFocusIndex(6, 'ArrowDown')).toBe(0);
    });
  });

  describe('AC#4: Home returns 0 and End returns 8 from any cell', () => {
    test('Home from any cell goes to 0', () => {
      for (let i = 0; i <= 8; i++) {
        expect(nextFocusIndex(i, 'Home')).toBe(0);
      }
    });

    test('End from any cell goes to 8', () => {
      for (let i = 0; i <= 8; i++) {
        expect(nextFocusIndex(i, 'End')).toBe(8);
      }
    });
  });

  describe('AC#5: returns the current index unchanged for any other key', () => {
    test('unknown named key leaves the index unchanged', () => {
      expect(nextFocusIndex(4, 'Enter')).toBe(4);
    });

    test('returns current index for any other key from every cell', () => {
      for (let i = 0; i <= 8; i++) {
        expect(nextFocusIndex(i, 'SomeOtherKey')).toBe(i);
      }
    });
  });
});
