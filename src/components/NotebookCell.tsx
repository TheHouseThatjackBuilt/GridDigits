import { motion, useReducedMotion } from "motion/react";
import type { GameCell } from "@/game/types";

interface NotebookCellProps {
  cell: GameCell;
  selected: boolean;
  hinted: boolean;
  recentlyCrossed: boolean;
  onClick: (cellId: number) => void;
}

export function NotebookCell({
  cell,
  selected,
  hinted,
  recentlyCrossed,
  onClick,
}: NotebookCellProps) {
  const prefersReducedMotion = useReducedMotion();
  const isResolvedHit = recentlyCrossed && cell.crossed;
  const className = [
    "notebook-cell",
    cell.crossed ? "is-crossed" : "",
    selected ? "is-selected" : "",
    hinted ? "is-hinted" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.button
      type="button"
      className={className}
      onClick={() => onClick(cell.id)}
      aria-pressed={selected}
      aria-label={`Цифра ${cell.value}`}
      whileHover={
        cell.crossed || prefersReducedMotion
          ? undefined
          : {
              scale: 1.05,
              y: -2,
              rotate: -2,
            }
      }
      whileTap={
        cell.crossed || prefersReducedMotion
          ? undefined
          : {
              scale: 0.9,
              y: 1,
              rotate: 2,
            }
      }
      animate={
        prefersReducedMotion
          ? {
              opacity: cell.crossed ? 0.55 : 1,
            }
          : {
              scale: isResolvedHit ? [1, 1.18, 0.72, 1.08, 1] : 1,
              y:
                isResolvedHit
                  ? [0, -10, 4, 0]
                  : 0,
              rotate: isResolvedHit ? [0, -7, 5, 0] : 0,
              opacity: cell.crossed ? 0.66 : 1,
              boxShadow:
                isResolvedHit
                  ? [
                      "0 0 0 rgba(195, 86, 55, 0)",
                      "0 14px 28px rgba(195, 86, 55, 0.22)",
                      "0 0 0 rgba(195, 86, 55, 0)",
                    ]
                  : selected
                    ? "inset 0 0 0 1px rgba(22, 49, 79, 0.18), 0 6px 14px rgba(22, 49, 79, 0.05)"
                    : "inset 0 0 0 0 rgba(21, 78, 147, 0), 0 0 0 rgba(0, 0, 0, 0)",
            }
      }
      transition={{
        duration: isResolvedHit ? 0.56 : 0.18,
        ease: "easeOut",
      }}
    >
      <motion.span
        className="notebook-cell-aura"
        aria-hidden="true"
        animate={
          prefersReducedMotion
            ? { opacity: 0 }
            : {
                opacity:
                  isResolvedHit
                    ? [0, 0.95, 0]
                    : hinted && !cell.crossed
                      ? 0.18
                      : 0,
                scale:
                  isResolvedHit
                    ? [0.6, 1.4, 1.85]
                    : 1,
              }
        }
        transition={{
          duration: isResolvedHit ? 0.52 : 0.18,
          ease: "easeOut",
        }}
      />
      <motion.span
        className="notebook-cell-slash"
        aria-hidden="true"
        animate={
          cell.crossed
            ? prefersReducedMotion
              ? { opacity: 1, scaleX: 1 }
              : {
                  opacity: 1,
                  scaleX: isResolvedHit ? [0.2, 1.08, 1] : 1,
                  rotate: isResolvedHit ? [-12, 6, -6] : -7,
                }
            : { opacity: 0, scaleX: 0.2, rotate: -7 }
        }
        transition={{
          duration: isResolvedHit ? 0.42 : 0.14,
          ease: [0.2, 0.9, 0.2, 1],
        }}
      />
      <motion.span
        className="notebook-cell-value"
        animate={
          prefersReducedMotion || !isResolvedHit
            ? undefined
            : {
                scale: [1, 1.16, 0.82, 1],
                y: [0, -7, 0],
              }
        }
        transition={{
          duration: 0.42,
          ease: [0.2, 0.9, 0.2, 1],
        }}
      >
        {cell.value}
      </motion.span>
    </motion.button>
  );
}
