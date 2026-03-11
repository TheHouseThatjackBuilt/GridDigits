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
      <div className="stats-strip">
        <div className="stats-card stats-pill">
          <p className="stats-label">Ходы</p>
          <p className="stats-value">{moveCount}</p>
        </div>
        <div className="stats-card stats-pill">
          <p className="stats-label">Осталось цифр</p>
          <p className="stats-value">{remainingCount}</p>
        </div>
      </div>

      <div className="actions">
        <button
          type="button"
          className="action-button action-button-primary"
          onClick={onCheckMoves}
        >
          Есть ли ходы?
        </button>
        <button
          type="button"
          className="action-button action-button-secondary"
          onClick={onWriteRemaining}
          disabled={isVictory}
        >
          Выписать остаток
        </button>
        <button
          type="button"
          className="action-button action-button-tertiary"
          onClick={onUndo}
          disabled={!canUndo}
        >
          Ход назад
        </button>
        <button
          type="button"
          className="action-button action-button-tertiary"
          onClick={onNewGame}
        >
          Новая игра
        </button>
      </div>
    </aside>
  );
}
