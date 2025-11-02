import { GripVertical, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueuedTaskProps {
  id: string;
  title: string;
  index: number;
  backgroundColor?: string;
  outlineColor?: string;
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
  backgroundColor = "#dbeafe",
  outlineColor = "#3b82f6",
  isSelected = false,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onClick,
  onQuickStart,
}: QueuedTaskProps) {
  const selectedBgColor = "#bfdbfe";

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
      className="flex items-center gap-2 py-2 px-3 rounded-lg border-2 cursor-move hover-elevate active-elevate-2 transition-all duration-200"
      style={{
        backgroundColor: isSelected ? selectedBgColor : backgroundColor,
        borderColor: outlineColor,
      }}
      data-testid={`queued-task-${id}`}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <div className="text-sm font-bold flex-1 text-gray-800 dark:text-gray-300">
        {title}
      </div>
      {isSelected && (
        <Button
          size="icon"
          variant="ghost"
          onClick={handleQuickStartClick}
          className="w-7 h-7 flex-shrink-0"
          data-testid={`button-quick-start-${id}`}
        >
          <Play className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
