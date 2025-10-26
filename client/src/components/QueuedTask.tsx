import { GripVertical } from "lucide-react";

interface QueuedTaskProps {
  id: string;
  title: string;
  index: number;
  backgroundColor?: string;
  outlineColor?: string;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  onClick?: () => void;
}

export default function QueuedTask({
  id,
  title,
  index,
  backgroundColor = "#dbeafe",
  outlineColor = "#3b82f6",
  onDragStart,
  onDragEnter,
  onDragEnd,
  onClick,
}: QueuedTaskProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className="flex items-center gap-2 py-2 px-3 rounded-lg border-2 cursor-move hover-elevate active-elevate-2 transition-all duration-200"
      style={{
        backgroundColor,
        borderColor: outlineColor,
      }}
      data-testid={`queued-task-${id}`}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <div className="text-sm font-medium flex-1" style={{ color: "#1f2937" }}>
        {title}
      </div>
    </div>
  );
}
