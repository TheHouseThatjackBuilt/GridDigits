import { cloneCells, cloneSnapshot, isDigit, isRecord } from "./helpers";
import { GRID_WIDTH } from "./types";
import type { GameCell, GameSnapshot, GameState } from "./types";

interface PersistedGameState {
  width: number;
  cells: GameCell[];
  moveCount: number;
  nextCellId: number;
}

interface LegacyGameState extends PersistedGameState {
  history: GameSnapshot[];
}

function isGameCell(value: unknown): value is GameCell {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    Number.isInteger(value.id) &&
    value.id > 0 &&
    isDigit(value.value) &&
    typeof value.crossed === "boolean"
  );
}

function isGameSnapshot(value: unknown): value is GameSnapshot {
  return (
    isRecord(value) &&
    Array.isArray(value.cells) &&
    value.cells.every(isGameCell) &&
    typeof value.moveCount === "number" &&
    Number.isInteger(value.moveCount) &&
    value.moveCount >= 0 &&
    typeof value.nextCellId === "number" &&
    Number.isInteger(value.nextCellId) &&
    value.nextCellId >= 1
  );
}

function isPersistedGameState(value: unknown): value is PersistedGameState {
  return (
    isRecord(value) &&
    value.width === GRID_WIDTH &&
    Array.isArray(value.cells) &&
    value.cells.every(isGameCell) &&
    typeof value.moveCount === "number" &&
    Number.isInteger(value.moveCount) &&
    value.moveCount >= 0 &&
    typeof value.nextCellId === "number" &&
    Number.isInteger(value.nextCellId) &&
    value.nextCellId >= 1
  );
}

function isLegacyGameState(value: unknown): value is LegacyGameState {
  return (
    isRecord(value) &&
    isPersistedGameState(value) &&
    Array.isArray(value.history) &&
    value.history.every(isGameSnapshot)
  );
}

export function serializeGameState(state: GameState): string {
  return JSON.stringify({
    width: state.width,
    cells: state.cells,
    moveCount: state.moveCount,
    nextCellId: state.nextCellId,
  });
}

export function parseGameState(serialized: string | null): GameState | null {
  if (serialized === null) {
    return null;
  }

  try {
    const parsed = JSON.parse(serialized) as unknown;

    if (isLegacyGameState(parsed)) {
      return {
        width: parsed.width,
        cells: cloneCells(parsed.cells),
        moveCount: parsed.moveCount,
        history: parsed.history.map(cloneSnapshot).slice(-1),
        nextCellId: parsed.nextCellId,
      };
    }

    if (!isPersistedGameState(parsed)) {
      return null;
    }

    return {
      width: parsed.width,
      cells: cloneCells(parsed.cells),
      moveCount: parsed.moveCount,
      history: [],
      nextCellId: parsed.nextCellId,
    };
  } catch {
    return null;
  }
}
