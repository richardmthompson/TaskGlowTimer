import { GripVertical, Play } from "lucide-react";

interface QueuedTaskProps {
  id: string;
  title: string;
  index: number;
  isSelected?: boolean;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  onClick?: () => void;
  onQuickStart?: () => void;
}

export default function QueuedTask({
  id,
  title,
  index,
  isSelected = false,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onClick,
  onQuickStart,
}: QueuedTaskProps) {
  const handleQuickStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickStart?.();
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group flex items-center gap-2 min-h-11 py-2 px-3 rounded-card border-thin cursor-move hover-elevate active-elevate-2 transition-transform duration-fast ease-neo ${
        isSelected
          ? "bg-muted border-primary neo-selected"
          : "bg-muted border-border shadow-neo-sm"
      }`}
      data-testid={`queued-task-${id}`}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <span className="font-mono text-[10px] font-bold text-[hsl(var(--primary-deep))] flex-shrink-0">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="text-sm font-bold flex-1 text-foreground">
        {title}
      </div>
      <button
        onClick={handleQuickStartClick}
        className={`w-11 h-11 items-center justify-center flex-shrink-0 hover-elevate active-elevate-2 ${
          isSelected ? "flex" : "hidden group-hover:flex"
        }`}
        aria-label="Move task to sticky note"
        data-testid={`button-quick-start-${id}`}
      >
        <Play className="w-4 h-4" />
      </button>
    </div>
  );
}
