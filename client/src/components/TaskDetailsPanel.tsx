import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskDetailsPanelProps {
  task: {
    title: string;
    startTime: string;
    endTime: string;
  } | null;
  onClose: () => void;
  backgroundColor?: string;
  outlineColor?: string;
}

export default function TaskDetailsPanel({
  task,
  onClose,
  backgroundColor = "#d1fae5",
  outlineColor = "#d97706",
}: TaskDetailsPanelProps) {
  if (!task) return null;

  return (
    <div
      data-testid="panel-task-details"
      className="mt-8 p-6 rounded-xl border-2 relative animate-in fade-in slide-in-from-bottom-4 duration-300"
      style={{
        backgroundColor,
        borderColor: outlineColor,
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
          Task Details
        </div>

        <div className="text-lg font-medium" style={{ color: "#1f2937" }}>
          {task.title}
        </div>

        <div className="flex gap-6 text-sm font-mono" style={{ color: "#1f2937" }}>
          <div>
            <span className="text-muted-foreground">Started:</span> {task.startTime}
          </div>
          <div>
            <span className="text-muted-foreground">Ended:</span> {task.endTime}
          </div>
        </div>
      </div>
    </div>
  );
}
