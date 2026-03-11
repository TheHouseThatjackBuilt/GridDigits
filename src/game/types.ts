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

export type CollapseRowsAttemptResult =
  | {
      ok: true;
      state: GameState;
      removedRowCount: number;
    }
  | {
      ok: false;
      state: GameState;
      removedRowCount: number;
      reason: "no_rows";
    };
