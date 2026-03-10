import assert from "node:assert/strict";
import {
  GRID_WIDTH,
  createNewGame,
  crossPair,
  findAvailablePair,
} from "../.temp-test-build/src/game/engine.js";

function createState(values, crossedIndexes = []) {
  const cells = values.map((value, index) => ({
    id: index + 1,
    value,
    crossed: crossedIndexes.includes(index),
  }));

  return {
    width: GRID_WIDTH,
    cells,
    moveCount: 0,
    history: [],
    nextCellId: cells.length + 1,
  };
}

function runCase(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

runCase("allows matching pair in the same row when only crossed cells are between", () => {
  const state = createState([5, 1, 5], [1]);
  const result = crossPair(state, 1, 3);

  assert.equal(result.ok, true);
});

runCase("allows matching pair across wrapped rows by reading order", () => {
  const state = createState([
    1, 2, 3, 4, 5, 6, 7, 8, 5,
    1, 1, 5,
  ], [9, 10]);
  const result = crossPair(state, 9, 12);

  assert.equal(result.ok, true);
});

runCase("blocks wrapped pair when a live digit remains between them in reading order", () => {
  const state = createState([
    1, 2, 3, 4, 5, 6, 7, 8, 5,
    1, 5,
  ]);
  const result = crossPair(state, 9, 11);

  assert.equal(result.ok, false);
  assert.equal(result.reason, "blocked");
});

runCase("findAvailablePair sees wrapped reading-order pairs", () => {
  const state = createState([
    1, 2, 3, 4, 5, 6, 7, 8, 5,
    1, 1, 5,
  ], [9, 10]);
  const pair = findAvailablePair(state);

  assert.deepEqual(pair, { firstId: 9, secondId: 12 });
});

runCase("new game starts with expected number of cells", () => {
  const state = createNewGame();

  assert.equal(state.width, GRID_WIDTH);
  assert.equal(state.cells.length, 27);
});

console.log("All engine tests passed.");