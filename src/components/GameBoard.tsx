import type { AvailablePair, GameCell } from "@/game/types";
import { GRID_WIDTH } from "@/game/types";
import { NotebookCell } from "./NotebookCell";

interface GameBoardProps {
  cells: GameCell[];
  selectedIds: number[];
  hintPairs: AvailablePair[];
  onCellClick: (cellId: number) => void;
}

function chunkCells(cells: GameCell[]): GameCell[][] {
  const rows: GameCell[][] = [];

  for (let index = 0; index < cells.length; index += GRID_WIDTH) {
    rows.push(cells.slice(index, index + GRID_WIDTH));
  }

  return rows;
}

function collectHintedIds(hintPairs: AvailablePair[]): Set<number> {
  const hintedIds = new Set<number>();

  for (const pair of hintPairs) {
    hintedIds.add(pair.firstId);
    hintedIds.add(pair.secondId);
  }

  return hintedIds;
}

export function GameBoard({
  cells,
  selectedIds,
  hintPairs,
  onCellClick,
}: GameBoardProps) {
  const rows = chunkCells(cells);
  const hintedIds = collectHintedIds(hintPairs);

  return (
    <section className="board-shell" aria-label="\u0418\u0433\u0440\u043e\u0432\u043e\u0435 \u043f\u043e\u043b\u0435">
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
