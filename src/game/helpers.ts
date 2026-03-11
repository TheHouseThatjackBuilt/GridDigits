import type { Digit, GameCell, GameSnapshot, GameState } from "./types.js";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isDigit(value: unknown): value is Digit {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 9
  );
}

export function cloneCells(cells: readonly GameCell[]): GameCell[] {
  return cells.map((cell) => ({ ...cell }));
}

export function cloneSnapshot(snapshot: GameSnapshot): GameSnapshot {
  return {
    cells: cloneCells(snapshot.cells),
    moveCount: snapshot.moveCount,
    nextCellId: snapshot.nextCellId,
  };
}

export function snapshotState(state: GameState): GameSnapshot {
  return {
    cells: cloneCells(state.cells),
    moveCount: state.moveCount,
    nextCellId: state.nextCellId,
  };
}

export function digitsFromString(sequence: string): Digit[] {
  const digits: Digit[] = [];

  for (const symbol of sequence) {
    const parsed = Number(symbol);

    if (isDigit(parsed)) {
      digits.push(parsed);
    }
  }

  return digits;
}

export function createCellsFromDigits(
  digits: readonly Digit[],
  startId = 1,
): GameCell[] {
  return digits.map((digit, index) => ({
    id: startId + index,
    value: digit,
    crossed: false,
  }));
}

export function getCellIndex(state: GameState, cellId: number): number {
  return state.cells.findIndex((cell) => cell.id === cellId);
}
