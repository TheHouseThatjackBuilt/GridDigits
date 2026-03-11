export {
  canUndo,
  createNewGame,
  crossPair,
  appendRemainingDigits,
  undoMove,
  getRemainingCount,
  isVictory,
  restoreGameState,
  serializeGameState,
} from "./state";
export {
  findAvailablePair,
  findAvailablePairs,
  getCellCoordinates,
  validatePair,
} from "./rules";
export { GRID_WIDTH, START_SEQUENCE } from "./types";
export type {
  AppendAttemptResult,
  AvailablePair,
  CellCoordinates,
  Digit,
  GameCell,
  GameSnapshot,
  GameState,
  PairAttemptResult,
  PairFailureReason,
  UndoAttemptResult,
} from "./types";
