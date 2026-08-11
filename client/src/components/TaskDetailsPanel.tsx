import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface CompletedTask {
  type: 'completed';
  title: string;
  startTime: string;
  endTime: string;
  goalId?: string | null;
}

interface QueuedTask {
  type: 'queued';
  title: string;
  goalId?: string | null;
}

type Task = CompletedTask | QueuedTask;

interface TaskDetailsPanelProps {
  task: Task | null;
  onClose: () => void;
  goalTitle?: string;
}

export default function TaskDetailsPanel({
  task,
  onClose,
  goalTitle,
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

  return (
    <div
      ref={panelRef}
      data-testid="panel-task-details"
      className="mt-4 p-6 rounded-card bg-card text-card-foreground border-frame border-border shadow-neo-lg relative animate-in fade-in slide-in-from-bottom-4 duration-slow"
    >
      <button
        data-testid="button-close-details"
        onClick={onClose}
        aria-label="Close task details"
        className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center hover-elevate active-elevate-2"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-label text-muted-foreground">
            {isCompleted ? 'Completed Task' : 'Queued Task'}
          </div>

          <div className="text-lg font-medium text-card-foreground">
            {task.title}
          </div>
        </div>

        <div className="space-y-3">
          {isCompleted && (
            <div className="space-y-2 text-sm font-mono text-card-foreground">
              <div>
                <span className="text-muted-foreground">Started:</span> {task.startTime}
              </div>
              <div>
                <span className="text-muted-foreground">Ended:</span> {task.endTime}
              </div>
            </div>
          )}

          {goalTitle && (
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">Goal:</div>
              <div className="inline-block px-2 py-1 rounded-md text-sm font-semibold bg-primary text-primary-foreground border-thin border-border">
                {goalTitle}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
