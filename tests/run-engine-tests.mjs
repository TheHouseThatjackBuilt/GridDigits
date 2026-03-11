import assert from "node:assert/strict";
import {
  GRID_WIDTH,
  canCollapseRows,
  canUndo,
  collapseCrossedRows,
  createNewGame,
  crossPair,
  findAvailablePair,
  findAvailablePairs,
  isVictory,
  restoreGameState,
  serializeGameState,
  undoMove,
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

runCase("findAvailablePairs returns every valid pair for hint highlighting", () => {
  const state = createState([1, 9, 2, 8, 5, 5]);
  const pairs = findAvailablePairs(state);

  assert.deepEqual(pairs, [
    { firstId: 1, secondId: 2 },
    { firstId: 3, secondId: 4 },
    { firstId: 5, secondId: 6 },
  ]);
});

runCase("collapseCrossedRows removes only fully crossed rows", () => {
  const state = createState([
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    9, 8, 7, 6, 5, 4, 3, 2, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1,
  ], [9, 10, 11, 12, 13, 14, 15, 16, 17]);

  assert.equal(canCollapseRows(state), true);

  const result = collapseCrossedRows(state);

  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error("Expected fully crossed rows to collapse.");
  }

  assert.equal(result.removedRowCount, 1);
  assert.deepEqual(
    result.state.cells.map((cell) => cell.id),
    [...Array.from({ length: 9 }, (_, index) => index + 1), ...Array.from({ length: 9 }, (_, index) => index + 19)],
  );
});

runCase("collapseCrossedRows keeps rows with at least one live digit", () => {
  const state = createState([
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    9, 8, 7, 6, 5, 4, 3, 2, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1,
  ], [
    0, 1, 2, 3, 4, 5, 6, 7, 8,
    9, 11, 12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23, 24, 25, 26,
  ]);
  const result = collapseCrossedRows(state);

  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error("Expected rows with a live digit to stay on the board.");
  }

  assert.equal(result.removedRowCount, 2);
  assert.deepEqual(
    result.state.cells.map((cell) => cell.id),
    Array.from({ length: 9 }, (_, index) => index + 10),
  );
});

runCase("collapseCrossedRows reports when there is nothing to remove", () => {
  const state = createState([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const result = collapseCrossedRows(state);

  assert.equal(canCollapseRows(state), false);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "no_rows");
});

runCase("collapseCrossedRows is undoable", () => {
  const state = createState([
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    9, 8, 7, 6, 5, 4, 3, 2, 1,
  ], [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const collapsed = collapseCrossedRows(state);

  assert.equal(collapsed.ok, true);

  if (!collapsed.ok) {
    throw new Error("Expected row collapse to succeed.");
  }

  const undoResult = undoMove(collapsed.state);

  assert.equal(undoResult.ok, true);

  if (!undoResult.ok) {
    throw new Error("Undo should restore the collapsed rows.");
  }

  assert.deepEqual(undoResult.state.cells, state.cells);
});

runCase("undo keeps only one previous step", () => {
  const firstMove = crossPair(createState([1, 9, 5, 5]), 1, 2);

  assert.equal(firstMove.ok, true);

  if (!firstMove.ok) {
    throw new Error("First move should succeed.");
  }

  const secondMove = crossPair(firstMove.state, 3, 4);

  assert.equal(secondMove.ok, true);

  if (!secondMove.ok) {
    throw new Error("Second move should succeed.");
  }

  assert.equal(canUndo(firstMove.state), true);
  assert.equal(firstMove.state.history.length, 1);
  assert.equal(canUndo(secondMove.state), true);
  assert.equal(secondMove.state.history.length, 1);

  const undoResult = undoMove(secondMove.state);

  assert.equal(undoResult.ok, true);

  if (!undoResult.ok) {
    throw new Error("Undo should succeed after one move.");
  }

  assert.deepEqual(undoResult.state.cells, firstMove.state.cells);
  assert.equal(canUndo(undoResult.state), false);
});

runCase("serialized state restores without undo history", () => {
  const result = crossPair(createState([5, 1, 5], [1]), 1, 3);

  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error("Pair should be crossed before serialization.");
  }

  const restored = restoreGameState(serializeGameState(result.state));

  assert.equal(restored.moveCount, result.state.moveCount);
  assert.equal(restored.nextCellId, result.state.nextCellId);
  assert.equal(restored.history.length, 0);
  assert.deepEqual(restored.cells, result.state.cells);
});

runCase("victory remains true when collapsed rows leave an empty board", () => {
  const state = createState([1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const result = collapseCrossedRows(state);

  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error("Expected fully crossed board to collapse.");
  }

  assert.deepEqual(result.state.cells, []);
  assert.equal(isVictory(result.state), true);
});

runCase("new game starts with expected number of cells", () => {
  const state = createNewGame();

  assert.equal(state.width, GRID_WIDTH);
  assert.equal(state.cells.length, 27);
});

console.log("All engine tests passed.");
