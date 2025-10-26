import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

interface CompletedTask {
  type: 'completed';
  title: string;
  startTime: string;
  endTime: string;
}

interface QueuedTask {
  type: 'queued';
  title: string;
}

type Task = CompletedTask | QueuedTask;

interface TaskDetailsPanelProps {
  task: Task | null;
  onClose: () => void;
  completedBgColor?: string;
  queuedBgColor?: string;
  outlineColor?: string;
}

export default function TaskDetailsPanel({
  task,
  onClose,
  completedBgColor = "#d1fae5",
  queuedBgColor = "#dbeafe",
  outlineColor = "#d97706",
}: TaskDetailsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (task) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [task, onClose]);

  if (!task) return null;

  const isCompleted = task.type === 'completed';
  const backgroundColor = isCompleted ? completedBgColor : queuedBgColor;
  const borderColor = isCompleted ? outlineColor : '#3b82f6';

  return (
    <div
      ref={panelRef}
      data-testid="panel-task-details"
      className="mt-8 p-6 rounded-xl border-2 relative animate-in fade-in slide-in-from-bottom-4 duration-300"
      style={{
        backgroundColor,
        borderColor,
      }}
    >
      <Button
        data-testid="button-close-details"
        size="icon"
        variant="ghost"
        onClick={onClose}
        className="absolute top-2 right-2 w-8 h-8"
      >
        <X className="w-4 h-4" />
      </Button>

      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {isCompleted ? 'Completed Task Details' : 'Queued Task Details'}
        </div>

        <div className="text-lg font-medium" style={{ color: "#1f2937" }}>
          {task.title}
        </div>

        {isCompleted && (
          <div className="flex gap-6 text-sm font-mono" style={{ color: "#1f2937" }}>
            <div>
              <span className="text-muted-foreground">Started:</span> {task.startTime}
            </div>
            <div>
              <span className="text-muted-foreground">Ended:</span> {task.endTime}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
