export {
  appendRemainingDigits,
  canCollapseRows,
  canUndo,
  collapseCrossedRows,
  createNewGame,
  crossPair,
  getRemainingCount,
  isVictory,
  restoreGameState,
  serializeGameState,
  undoMove,
} from "./state.js";
export {
  findAvailablePair,
  findAvailablePairs,
  getCellCoordinates,
  validatePair,
} from "./rules.js";
export { GRID_WIDTH, START_SEQUENCE } from "./types.js";
export type {
  AppendAttemptResult,
  AvailablePair,
  CellCoordinates,
  CollapseRowsAttemptResult,
  Digit,
  GameCell,
  GameSnapshot,
  GameState,
  PairAttemptResult,
  PairFailureReason,
  UndoAttemptResult,
} from "./types.js";
