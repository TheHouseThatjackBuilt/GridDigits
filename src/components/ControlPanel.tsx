interface ControlPanelProps {
  moveCount: number;
  remainingCount: number;
  canUndo: boolean;
  isVictory: boolean;
  onUndo: () => void;
  onNewGame: () => void;
  onWriteRemaining: () => void;
  onCheckMoves: () => void;
}

export function ControlPanel({
  moveCount,
  remainingCount,
  canUndo,
  isVictory,
  onUndo,
  onNewGame,
  onWriteRemaining,
  onCheckMoves,
}: ControlPanelProps) {
  return (
    <aside className="control-panel">
      <div className="stats-card">
        <p className="stats-label">Ходы</p>
        <p className="stats-value">{moveCount}</p>
      </div>
      <div className="stats-card">
        <p className="stats-label">Осталось цифр</p>
        <p className="stats-value">{remainingCount}</p>
      </div>

      <div className="actions">
        <button type="button" onClick={onWriteRemaining} disabled={isVictory}>
          Выписать остаток
        </button>
        <button type="button" onClick={onCheckMoves}>
          Есть ли ходы?
        </button>
        <button type="button" onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
        <button type="button" onClick={onNewGame}>
          New Game
        </button>
      </div>
    </aside>
  );
}
