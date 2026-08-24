// Test-runner entry point (directory-argument compatibility shim).
//
// The project's verification command runs the suite by pointing Node's
// built-in test runner at this directory:
//
//     node --test web/tictactoe/src/
//
// On Node >= 21 that directory is walked recursively and every file matching
// the default test-file naming convention (e.g. `*.test.js`) is discovered and
// run. This module does NOT match that convention, so it is ignored there and
// the suite is discovered directly from `engine.test.js`.
//
// Some Node builds instead resolve a directory positional to its `index.js`
// entry and execute that single module as a test file. Importing the test
// files here makes the exact `node --test <dir>/` command run the full suite on
// those builds too, so the verification command behaves identically everywhere.
//
// Keep this list in sync with the `*.test.js` files in this directory.
import './engine.test.js';
