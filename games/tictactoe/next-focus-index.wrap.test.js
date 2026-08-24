// AC#3: nextFocusIndex wraps at the edges:
//   from 2, ArrowRight is 0; from 0, ArrowLeft is 2;
//   from 0, ArrowUp is 6; from 6, ArrowDown is 0.
"use strict";

const { nextFocusIndex } = require("./game.js");

describe("nextFocusIndex wraps at the edges (AC#3)", () => {
  test("from 2, ArrowRight wraps to 0", () => {
    expect(nextFocusIndex(2, "ArrowRight")).toBe(0);
  });

  test("from 0, ArrowLeft wraps to 2", () => {
    expect(nextFocusIndex(0, "ArrowLeft")).toBe(2);
  });

  test("from 0, ArrowUp wraps to 6", () => {
    expect(nextFocusIndex(0, "ArrowUp")).toBe(6);
  });

  test("from 6, ArrowDown wraps to 0", () => {
    expect(nextFocusIndex(6, "ArrowDown")).toBe(0);
  });
});
