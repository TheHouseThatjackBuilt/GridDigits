import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { AvailablePair, GameCell } from "@/game/types";
import { GRID_WIDTH } from "@/game/types";
import { NotebookCell } from "./NotebookCell";

interface GameBoardProps {
  cells: GameCell[];
  selectedIds: number[];
  hintPairs: AvailablePair[];
  recentlyCrossedIds: number[];
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

function getRowKey(row: GameCell[]): string {
  return row.map((cell) => cell.id).join("-");
}

export function GameBoard({
  cells,
  selectedIds,
  hintPairs,
  recentlyCrossedIds,
  onCellClick,
}: GameBoardProps) {
  const rows = chunkCells(cells);
  const hintedIds = collectHintedIds(hintPairs);
  const recentlyCrossedSet = new Set(recentlyCrossedIds);
  const prefersReducedMotion = useReducedMotion();

  const rowLayoutTransition = prefersReducedMotion
    ? { duration: 0 }
    : {
        type: "spring" as const,
        stiffness: 220,
        damping: 24,
        mass: 0.9,
      };

  const rowEnter = prefersReducedMotion
    ? undefined
    : { opacity: 0, y: 18, scaleY: 0.9, filter: "blur(8px)" };

  const rowAnimate = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scaleY: 1, filter: "blur(0px)" };

  const rowExit = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: -26, scaleY: 0.38, filter: "blur(10px)" };

  return (
    <section className="board-shell" aria-label="\u0418\u0433\u0440\u043e\u0432\u043e\u0435 \u043f\u043e\u043b\u0435">
      <div className="board-grid">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((row, index) => {
            const isLastRow = index === rows.length - 1;

            return (
              <motion.div
                layout
                className="board-row"
                key={getRowKey(row)}
                initial={rowEnter}
                animate={rowAnimate}
                exit={rowExit}
                transition={{
                  layout: rowLayoutTransition,
                  opacity: { duration: prefersReducedMotion ? 0 : 0.18 },
                  filter: { duration: prefersReducedMotion ? 0 : 0.22 },
                  y: rowLayoutTransition,
                  scaleY: {
                    duration: prefersReducedMotion ? 0 : 0.28,
                    ease: [0.2, 0.9, 0.2, 1],
                  },
                }}
              >
                {row.map((cell) => (
                  <NotebookCell
                    key={cell.id}
                    cell={cell}
                    selected={selectedIds.includes(cell.id)}
                    hinted={hintedIds.has(cell.id)}
                    recentlyCrossed={recentlyCrossedSet.has(cell.id)}
                    onClick={onCellClick}
                  />
                ))}
                {isLastRow ? <span className="board-dot">.</span> : null}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
