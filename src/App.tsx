import { useEffect, useState } from "react";
import { ControlPanel } from "./components/ControlPanel";
import { GameBoard } from "./components/GameBoard";
import {
  appendRemainingDigits,
  canUndo,
  createNewGame,
  crossPair,
  findAvailablePair,
  getCellCoordinates,
  getRemainingCount,
  isVictory,
  restoreGameState,
  serializeGameState,
  undoMove,
  type AvailablePair,
  type GameState,
  type PairFailureReason,
} from "./game/engine";

const STORAGE_KEY = "grid-digits.game-state";

function getInitialGameState(): GameState {
  if (typeof window === "undefined") {
    return createNewGame();
  }

  return restoreGameState(window.localStorage.getItem(STORAGE_KEY));
}

function pairFailureMessage(reason: PairFailureReason): string {
  switch (reason) {
    case "same_cell":
      return "Нужно выбрать две разные клетки.";
    case "missing_cell":
      return "Одна из выбранных клеток не найдена.";
    case "crossed_cell":
      return "Зачёркнутые клетки уже считаются пустыми.";
    case "mismatch":
      return "Пара подходит только если цифры равны или дают сумму 10.";
    case "not_aligned":
      return "Пара должна стоять в одной строке, в одном столбце или идти через перенос строки по порядку чтения.";
    case "blocked":
      return "Между цифрами есть незачёркнутые клетки.";
  }
}

function formatPairHint(game: GameState, pair: AvailablePair): string {
  const first = getCellCoordinates(game, pair.firstId);
  const second = getCellCoordinates(game, pair.secondId);

  if (first === null || second === null) {
    return "Ход найден.";
  }

  return `Есть ход: (${first.row}, ${first.column}) и (${second.row}, ${second.column}).`;
}

export default function App() {
  const [game, setGame] = useState<GameState>(getInitialGameState);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [hintPair, setHintPair] = useState<AvailablePair | null>(null);
  const [message, setMessage] = useState<string>(
    "Выберите две цифры в строке, столбце или через перенос строки.",
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, serializeGameState(game));
  }, [game]);

  const handleCellClick = (cellId: number) => {
    const clickedCell = game.cells.find((cell) => cell.id === cellId);

    if (clickedCell === undefined) {
      return;
    }

    if (clickedCell.crossed) {
      setMessage("Эта клетка уже зачёркнута.");
      return;
    }

    setHintPair(null);

    if (selectedIds.length === 0) {
      setSelectedIds([cellId]);
      setMessage("Первая цифра выбрана.");
      return;
    }

    if (selectedIds.length === 1) {
      const firstId = selectedIds[0];

      if (firstId === cellId) {
        setSelectedIds([]);
        setMessage("Выбор снят.");
        return;
      }

      const result = crossPair(game, firstId, cellId);

      if (result.ok) {
        const nextGame = result.state;
        setGame(nextGame);
        setSelectedIds([]);
        setMessage(
          isVictory(nextGame)
            ? "Все цифры закрыты. Победа!"
            : "Пара зачёркнута.",
        );
        return;
      }

      setSelectedIds([cellId]);
      setMessage(pairFailureMessage(result.reason));
      return;
    }

    setSelectedIds([cellId]);
  };

  const handleUndo = () => {
    const result = undoMove(game);

    if (!result.ok) {
      setMessage("Откатывать пока нечего.");
      return;
    }

    setGame(result.state);
    setSelectedIds([]);
    setHintPair(null);
    setMessage("Последний ход отменён.");
  };

  const handleNewGame = () => {
    setGame(createNewGame());
    setSelectedIds([]);
    setHintPair(null);
    setMessage("Новая игра начата.");
  };

  const handleWriteRemaining = () => {
    const result = appendRemainingDigits(game);

    if (!result.ok) {
      setMessage("Нечего выписывать: все цифры уже закрыты.");
      return;
    }

    setGame(result.state);
    setSelectedIds([]);
    setHintPair(null);
    setMessage(`Выписано цифр: ${result.appendedCount}.`);
  };

  const handleCheckMoves = () => {
    const pair = findAvailablePair(game);

    if (pair === null) {
      setHintPair(null);
      setMessage("Доступных пар сейчас нет.");
      return;
    }

    setHintPair(pair);
    setMessage(formatPairHint(game, pair));
  };

  const victory = isVictory(game);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Grid Digits</p>
          <h1>Цифры в клетку</h1>
          <p className="hero-text">
            Цель игры - сократить все цифры.
            Порядок сокращения: либо парные цифры, либо цифры, сумма которых равна 10.
          </p>
        </div>
        <ControlPanel
          moveCount={game.moveCount}
          remainingCount={getRemainingCount(game)}
          canUndo={canUndo(game)}
          isVictory={victory}
          onUndo={handleUndo}
          onNewGame={handleNewGame}
          onWriteRemaining={handleWriteRemaining}
          onCheckMoves={handleCheckMoves}
        />
      </section>

      <section className="game-card">
        <div className="status-row">
          <p className="status-message">{message}</p>
          {victory ? <p className="victory-badge">Победа</p> : null}
        </div>
        <GameBoard
          cells={game.cells}
          selectedIds={selectedIds}
          hintPair={hintPair}
          onCellClick={handleCellClick}
        />
      </section>
    </main>
  );
}

