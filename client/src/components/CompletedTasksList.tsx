import CompletedTask from "./CompletedTask";

export interface CompletedTaskData {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

interface CompletedTasksListProps {
  tasks: CompletedTaskData[];
  backgroundColor?: string;
  outlineColor?: string;
  onTaskClick?: (task: CompletedTaskData) => void;
  selectedTaskId?: string | null;
}

export default function CompletedTasksList({
  tasks,
  backgroundColor = "#d1fae5",
  outlineColor = "#d97706",
  onTaskClick,
  selectedTaskId,
}: CompletedTasksListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-muted-foreground text-sm text-left py-8">
        No completed tasks yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-8rem)] pr-2">
      {tasks.map((task) => (
        <CompletedTask
          key={task.id}
          title={task.title}
          startTime={task.startTime}
          endTime={task.endTime}
          backgroundColor={backgroundColor}
          outlineColor={outlineColor}
          onClick={() => onTaskClick?.(task)}
          isSelected={selectedTaskId === task.id}
        />
      ))}
    </div>
  );
}
