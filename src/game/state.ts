import {
  cloneCells,
  cloneSnapshot,
  createCellsFromDigits,
  digitsFromString,
  getCellIndex,
  snapshotState,
} from "./helpers";
import { validatePair } from "./rules";
import { parseGameState, serializeGameState } from "./storage";
import { GRID_WIDTH, START_SEQUENCE } from "./types";
import type {
  AppendAttemptResult,
  GameState,
  PairAttemptResult,
  UndoAttemptResult,
} from "./types";

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

export function getRemainingCount(state: GameState): number {
  return state.cells.filter((cell) => !cell.crossed).length;
}

export function isVictory(state: GameState): boolean {
  return state.cells.length > 0 && getRemainingCount(state) === 0;
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
      history: [...state.history, snapshotState(state)],
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
      history: [...state.history, snapshotState(state)],
      nextCellId: state.nextCellId + appendedCells.length,
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