import { useEffect, useState } from "react";
import { ControlPanel } from "./components/ControlPanel";
import { GameBoard } from "./components/GameBoard";
import {
  appendRemainingDigits,
  canUndo,
  createNewGame,
  crossPair,
  findAvailablePairs,
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

function formatPairHint(game: GameState, pairs: AvailablePair[]): string {
  const firstPair = pairs[0];
  const first = getCellCoordinates(game, firstPair.firstId);
  const second = getCellCoordinates(game, firstPair.secondId);

  if (first === null || second === null) {
    return `Найдено пар: ${pairs.length}.`;
  }

  return `Найдено пар: ${pairs.length}. Например: (${first.row}, ${first.column}) и (${second.row}, ${second.column}).`;
}

export default function App() {
  const [game, setGame] = useState<GameState>(getInitialGameState);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [hintPairs, setHintPairs] = useState<AvailablePair[]>([]);
  const [message, setMessage] = useState<string>(
    "Выберите две цифры в строке, столбце или через перенос строки.",
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, serializeGameState(game));
    } catch (error) {
      console.warn("Failed to persist game state.", error);
    }
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

    setHintPairs([]);

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
    setHintPairs([]);
    setMessage("Последний ход отменён.");
  };

  const handleNewGame = () => {
    setGame(createNewGame());
    setSelectedIds([]);
    setHintPairs([]);
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
    setHintPairs([]);
    setMessage(`Выписано цифр: ${result.appendedCount}.`);
  };

  const handleCheckMoves = () => {
    const pairs = findAvailablePairs(game);

    if (pairs.length === 0) {
      setHintPairs([]);
      setMessage("Доступных пар сейчас нет.");
      return;
    }

    setHintPairs(pairs);
    setMessage(formatPairHint(game, pairs));
  };

  const victory = isVictory(game);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Grid Digits</p>
          <h1>Цифры в клетку</h1>
          <p className="hero-text">
            Цель игры - сократить все цифры. Порядок сокращения: либо парные
            цифры, либо цифры, сумма которых равна 10.
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
          hintPairs={hintPairs}
          onCellClick={handleCellClick}
        />
      </section>
    </main>
  );
}
