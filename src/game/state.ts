import {
  cloneCells,
  cloneSnapshot,
  createCellsFromDigits,
  digitsFromString,
  getCellIndex,
  snapshotState,
} from "./helpers.js";
import { validatePair } from "./rules.js";
import { parseGameState, serializeGameState } from "./storage.js";
import { GRID_WIDTH, START_SEQUENCE } from "./types.js";
import type {
  AppendAttemptResult,
  CollapseRowsAttemptResult,
  GameCell,
  GameState,
  PairAttemptResult,
  UndoAttemptResult,
} from "./types.js";

function createSingleStepHistory(state: GameState) {
  return [snapshotState(state)];
}

function getRows(cells: readonly GameCell[], width: number): GameCell[][] {
  const rows: GameCell[][] = [];

  for (let index = 0; index < cells.length; index += width) {
    rows.push(cells.slice(index, index + width));
  }

  return rows;
}

function getFullyCrossedRowCount(state: GameState): number {
  return getRows(state.cells, state.width).filter(
    (row) => row.length > 0 && row.every((cell) => cell.crossed),
  ).length;
}

export function createNewGame(): GameState {
  const initialCells = createCellsFromDigits(digitsFromString(START_SEQUENCE));

  return {
    width: GRID_WIDTH,
    cells: initialCells,
    moveCount: 0,
    history: [],
    nextCellId: initialCells.length + 1,
  };
}

export function restoreGameState(serialized: string | null): GameState {
  return parseGameState(serialized) ?? createNewGame();
}

export { serializeGameState };

export function canUndo(state: GameState): boolean {
  return state.history.length > 0;
}

export function canCollapseRows(state: GameState): boolean {
  return getFullyCrossedRowCount(state) > 0;
}

export function getRemainingCount(state: GameState): number {
  return state.cells.filter((cell) => !cell.crossed).length;
}

export function isVictory(state: GameState): boolean {
  return getRemainingCount(state) === 0;
}

export function crossPair(
  state: GameState,
  firstId: number,
  secondId: number,
): PairAttemptResult {
  const failureReason = validatePair(state, firstId, secondId);

  if (failureReason !== null) {
    return {
      ok: false,
      state,
      reason: failureReason,
    };
  }

  const nextCells = cloneCells(state.cells);
  const firstIndex = getCellIndex(state, firstId);
  const secondIndex = getCellIndex(state, secondId);

  nextCells[firstIndex].crossed = true;
  nextCells[secondIndex].crossed = true;

  return {
    ok: true,
    state: {
      width: state.width,
      cells: nextCells,
      moveCount: state.moveCount + 1,
      history: createSingleStepHistory(state),
      nextCellId: state.nextCellId,
    },
  };
}

export function appendRemainingDigits(state: GameState): AppendAttemptResult {
  const remainingDigits = state.cells
    .filter((cell) => !cell.crossed)
    .map((cell) => cell.value);

  if (remainingDigits.length === 0) {
    return {
      ok: false,
      state,
      appendedCount: 0,
      reason: "no_digits",
    };
  }

  const appendedCells = createCellsFromDigits(
    remainingDigits,
    state.nextCellId,
  );

  return {
    ok: true,
    appendedCount: appendedCells.length,
    state: {
      width: state.width,
      cells: [...cloneCells(state.cells), ...appendedCells],
      moveCount: state.moveCount + 1,
      history: createSingleStepHistory(state),
      nextCellId: state.nextCellId + appendedCells.length,
    },
  };
}

export function collapseCrossedRows(
  state: GameState,
): CollapseRowsAttemptResult {
  const rows = getRows(state.cells, state.width);
  const remainingRows = rows.filter(
    (row) => row.length > 0 && row.some((cell) => !cell.crossed),
  );
  const removedRowCount = rows.length - remainingRows.length;

  if (removedRowCount === 0) {
    return {
      ok: false,
      state,
      removedRowCount: 0,
      reason: "no_rows",
    };
  }

  return {
    ok: true,
    removedRowCount,
    state: {
      width: state.width,
      cells: cloneCells(remainingRows.flat()),
      moveCount: state.moveCount + 1,
      history: createSingleStepHistory(state),
      nextCellId: state.nextCellId,
    },
  };
}

export function undoMove(state: GameState): UndoAttemptResult {
  if (!canUndo(state)) {
    return {
      ok: false,
      state,
    };
  }

  const previousSnapshot = state.history[state.history.length - 1];

  return {
    ok: true,
    state: {
      width: state.width,
      cells: cloneCells(previousSnapshot.cells),
      moveCount: previousSnapshot.moveCount,
      history: state.history.slice(0, -1).map(cloneSnapshot),
      nextCellId: previousSnapshot.nextCellId,
    },
  };
}
