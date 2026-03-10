import { cloneCells, cloneSnapshot, isDigit, isRecord } from "./helpers";
import { GRID_WIDTH } from "./types";
import type { GameCell, GameSnapshot, GameState } from "./types";

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

function isGameState(value: unknown): value is GameState {
  return (
    isRecord(value) &&
    value.width === GRID_WIDTH &&
    Array.isArray(value.cells) &&
    value.cells.every(isGameCell) &&
    typeof value.moveCount === "number" &&
    Number.isInteger(value.moveCount) &&
    value.moveCount >= 0 &&
    Array.isArray(value.history) &&
    value.history.every(isGameSnapshot) &&
    typeof value.nextCellId === "number" &&
    Number.isInteger(value.nextCellId) &&
    value.nextCellId >= 1
  );
}

export function serializeGameState(state: GameState): string {
  return JSON.stringify(state);
}

export function parseGameState(serialized: string | null): GameState | null {
  if (serialized === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(serialized);

    if (!isGameState(parsed)) {
      return null;
    }

    return {
      width: parsed.width,
      cells: cloneCells(parsed.cells),
      moveCount: parsed.moveCount,
      history: parsed.history.map(cloneSnapshot),
      nextCellId: parsed.nextCellId,
    };
  } catch {
    return null;
  }
}