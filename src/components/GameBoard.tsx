import type { AvailablePair, GameCell } from "../game/engine";
import { GRID_WIDTH } from "../game/engine";
import { NotebookCell } from "./NotebookCell";

interface GameBoardProps {
  cells: GameCell[];
  selectedIds: number[];
  hintPair: AvailablePair | null;
  onCellClick: (cellId: number) => void;
}

function chunkCells(cells: GameCell[]): GameCell[][] {
  const rows: GameCell[][] = [];

  for (let index = 0; index < cells.length; index += GRID_WIDTH) {
    rows.push(cells.slice(index, index + GRID_WIDTH));
  }

  return rows;
}

export function GameBoard({
  cells,
  selectedIds,
  hintPair,
  onCellClick,
}: GameBoardProps) {
  const rows = chunkCells(cells);
  const hintedIds = new Set<number>(
    hintPair === null ? [] : [hintPair.firstId, hintPair.secondId],
  );

  return (
    <section className="board-shell" aria-label="Игровое поле">
      <div className="board-grid">
        {rows.map((row, index) => {
          const isLastRow = index === rows.length - 1;

          return (
            <div className="board-row" key={`row-${index}`}>
              {row.map((cell) => (
                <NotebookCell
                  key={cell.id}
                  cell={cell}
                  selected={selectedIds.includes(cell.id)}
                  hinted={hintedIds.has(cell.id)}
                  onClick={onCellClick}
                />
              ))}
              {isLastRow ? <span className="board-dot">.</span> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
