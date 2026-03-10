export const GRID_WIDTH = 9;
export const START_SEQUENCE = "123456789111213141516171819";

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface GameCell {
  id: number;
  value: Digit;
  crossed: boolean;
}

export interface GameSnapshot {
  cells: GameCell[];
  moveCount: number;
  nextCellId: number;
}

export interface GameState {
  width: number;
  cells: GameCell[];
  moveCount: number;
  history: GameSnapshot[];
  nextCellId: number;
}

export interface AvailablePair {
  firstId: number;
  secondId: number;
}

export interface CellCoordinates {
  row: number;
  column: number;
}

export type PairFailureReason =
  | "same_cell"
  | "missing_cell"
  | "crossed_cell"
  | "mismatch"
  | "not_aligned"
  | "blocked";

export type PairAttemptResult =
  | {
      ok: true;
      state: GameState;
    }
  | {
      ok: false;
      state: GameState;
      reason: PairFailureReason;
    };

export type AppendAttemptResult =
  | {
      ok: true;
      state: GameState;
      appendedCount: number;
    }
  | {
      ok: false;
      state: GameState;
      appendedCount: number;
      reason: "no_digits";
    };

export type UndoAttemptResult =
  | {
      ok: true;
      state: GameState;
    }
  | {
      ok: false;
      state: GameState;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDigit(value: unknown): value is Digit {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 9
  );
}

function cloneCells(cells: readonly GameCell[]): GameCell[] {
  return cells.map((cell) => ({ ...cell }));
}

function cloneSnapshot(snapshot: GameSnapshot): GameSnapshot {
  return {
    cells: cloneCells(snapshot.cells),
    moveCount: snapshot.moveCount,
    nextCellId: snapshot.nextCellId,
  };
}

function snapshotState(state: GameState): GameSnapshot {
  return {
    cells: cloneCells(state.cells),
    moveCount: state.moveCount,
    nextCellId: state.nextCellId,
  };
}

function digitsFromString(sequence: string): Digit[] {
  const digits: Digit[] = [];

  for (const symbol of sequence) {
    const parsed = Number(symbol);

    if (isDigit(parsed)) {
      digits.push(parsed);
    }
  }

  return digits;
}

function createCellsFromDigits(
  digits: readonly Digit[],
  startId = 1,
): GameCell[] {
  return digits.map((digit, index) => ({
    id: startId + index,
    value: digit,
    crossed: false,
  }));
}

function areDigitsCompatible(first: Digit, second: Digit): boolean {
  return first === second || first + second === 10;
}

function getCellIndex(state: GameState, cellId: number): number {
  return state.cells.findIndex((cell) => cell.id === cellId);
}

function canWrapByReadingOrder(
  firstIndex: number,
  secondIndex: number,
  width: number,
): boolean {
  const earlierIndex = Math.min(firstIndex, secondIndex);
  const laterIndex = Math.max(firstIndex, secondIndex);
  const earlierRow = Math.floor(earlierIndex / width);
  const laterRow = Math.floor(laterIndex / width);

  if (earlierRow === laterRow) {
    return false;
  }

  const earlierColumn = earlierIndex % width;
  const laterColumn = laterIndex % width;

  return laterColumn <= earlierColumn;
}

function getStepBetween(
  firstIndex: number,
  secondIndex: number,
  width: number,
): number | null {
  const firstRow = Math.floor(firstIndex / width);
  const secondRow = Math.floor(secondIndex / width);
  const firstColumn = firstIndex % width;
  const secondColumn = secondIndex % width;

  if (firstRow === secondRow) {
    return firstIndex < secondIndex ? 1 : -1;
  }

  if (firstColumn === secondColumn) {
    return firstIndex < secondIndex ? width : -width;
  }

  if (canWrapByReadingOrder(firstIndex, secondIndex, width)) {
    return firstIndex < secondIndex ? 1 : -1;
  }

  return null;
}

function isPathClear(
  cells: readonly GameCell[],
  firstIndex: number,
  secondIndex: number,
  step: number,
): boolean {
  for (
    let index = firstIndex + step;
    index !== secondIndex;
    index += step
  ) {
    if (!cells[index].crossed) {
      return false;
    }
  }

  return true;
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
  if (serialized === null) {
    return createNewGame();
  }

  try {
    const parsed: unknown = JSON.parse(serialized);

    if (!isGameState(parsed)) {
      return createNewGame();
    }

    return {
      width: parsed.width,
      cells: cloneCells(parsed.cells),
      moveCount: parsed.moveCount,
      history: parsed.history.map(cloneSnapshot),
      nextCellId: parsed.nextCellId,
    };
  } catch {
    return createNewGame();
  }
}

export function serializeGameState(state: GameState): string {
  return JSON.stringify(state);
}

export function canUndo(state: GameState): boolean {
  return state.history.length > 0;
}

export function getRemainingCount(state: GameState): number {
  return state.cells.filter((cell) => !cell.crossed).length;
}

export function isVictory(state: GameState): boolean {
  return state.cells.length > 0 && getRemainingCount(state) === 0;
}

export function getCellCoordinates(
  state: GameState,
  cellId: number,
): CellCoordinates | null {
  const index = getCellIndex(state, cellId);

  if (index === -1) {
    return null;
  }

  return {
    row: Math.floor(index / state.width) + 1,
    column: (index % state.width) + 1,
  };
}

export function validatePair(
  state: GameState,
  firstId: number,
  secondId: number,
): PairFailureReason | null {
  if (firstId === secondId) {
    return "same_cell";
  }

  const firstIndex = getCellIndex(state, firstId);
  const secondIndex = getCellIndex(state, secondId);

  if (firstIndex === -1 || secondIndex === -1) {
    return "missing_cell";
  }

  const firstCell = state.cells[firstIndex];
  const secondCell = state.cells[secondIndex];

  if (firstCell.crossed || secondCell.crossed) {
    return "crossed_cell";
  }

  if (!areDigitsCompatible(firstCell.value, secondCell.value)) {
    return "mismatch";
  }

  const step = getStepBetween(firstIndex, secondIndex, state.width);

  if (step === null) {
    return "not_aligned";
  }

  if (!isPathClear(state.cells, firstIndex, secondIndex, step)) {
    return "blocked";
  }

  return null;
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

export function findAvailablePair(state: GameState): AvailablePair | null {
  const activeCells = state.cells.filter((cell) => !cell.crossed);

  for (let firstIndex = 0; firstIndex < activeCells.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < activeCells.length;
      secondIndex += 1
    ) {
      const firstCell = activeCells[firstIndex];
      const secondCell = activeCells[secondIndex];

      if (!areDigitsCompatible(firstCell.value, secondCell.value)) {
        continue;
      }

      if (validatePair(state, firstCell.id, secondCell.id) === null) {
        return {
          firstId: firstCell.id,
          secondId: secondCell.id,
        };
      }
    }
  }

  return null;
}
