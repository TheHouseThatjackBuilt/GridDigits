import type { GameCell } from "../game/engine";

interface NotebookCellProps {
  cell: GameCell;
  selected: boolean;
  hinted: boolean;
  onClick: (cellId: number) => void;
}

export function NotebookCell({
  cell,
  selected,
  hinted,
  onClick,
}: NotebookCellProps) {
  const className = [
    "notebook-cell",
    cell.crossed ? "is-crossed" : "",
    selected ? "is-selected" : "",
    hinted ? "is-hinted" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={() => onClick(cell.id)}
      aria-pressed={selected}
      aria-label={`Цифра ${cell.value}`}
    >
      <span>{cell.value}</span>
    </button>
  );
}
