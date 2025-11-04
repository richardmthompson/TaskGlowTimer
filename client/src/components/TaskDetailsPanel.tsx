import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  completedBgColor?: string;
  queuedBgColor?: string;
  outlineColor?: string;
  goalTitle?: string;
  goalColor?: string;
}

export default function TaskDetailsPanel({
  task,
  onClose,
  completedBgColor = "#d1fae5",
  queuedBgColor = "#dbeafe",
  outlineColor = "#d97706",
  goalTitle,
  goalColor,
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
      className="mt-4 p-6 rounded-xl border-2 relative animate-in fade-in slide-in-from-bottom-4 duration-300"
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

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {isCompleted ? 'Completed Task' : 'Queued Task'}
          </div>

          <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
            {task.title}
          </div>
        </div>

        <div className="space-y-3">
          {isCompleted && (
            <div className="space-y-2 text-sm font-mono text-gray-700 dark:text-gray-300">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Started:</span> {task.startTime}
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Ended:</span> {task.endTime}
              </div>
            </div>
          )}
          
          {goalTitle && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Goal:</div>
              <div 
                className="inline-block px-2 py-1 rounded text-sm font-semibold"
                style={{
                  backgroundColor: goalColor,
                  color: '#000',
                }}
              >
                {goalTitle}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
