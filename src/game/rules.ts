import { getCellIndex } from "./helpers";
import type {
  AvailablePair,
  CellCoordinates,
  Digit,
  GameCell,
  GameState,
  PairFailureReason,
} from "./types";

function areDigitsCompatible(first: Digit, second: Digit): boolean {
  return first === second || first + second === 10;
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

  if (firstRow !== secondRow) {
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