import { useRef } from "react";
import QueuedTask from "./QueuedTask";
import { GripVertical } from "lucide-react";
import { EmptyState } from "./ui/EmptyState";
import { Kbd } from "./ui/Kbd";

export interface QueuedTaskData {
  id: string;
  title: string;
  goalId?: string | null;
}

interface QueuedTasksListProps {
  tasks: QueuedTaskData[];
  onReorder: (tasks: QueuedTaskData[]) => void;
  selectedTaskId?: string | null;
  onTaskClick?: (task: { type: 'queued'; title: string; id: string }) => void;
  onQuickStart?: (taskId: string) => void;
}

export default function QueuedTasksList({
  tasks,
  onReorder,
  selectedTaskId,
  onTaskClick,
  onQuickStart,
}: QueuedTasksListProps) {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newTasks = [...tasks];
      const draggedItem = newTasks[dragItem.current];
      newTasks.splice(dragItem.current, 1);
      newTasks.splice(dragOverItem.current, 0, draggedItem);
      onReorder(newTasks);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <EmptyState
          className="py-4"
          headline="Queue is dry"
          hint={<>press <Kbd className="font-bold">Q</Kbd> · line up the next task</>}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task, index) => (
        <QueuedTask
          key={task.id}
          id={task.id}
          title={task.title}
          index={index}
          isSelected={task.id === selectedTaskId}
          onDragStart={handleDragStart}
          onDragEnter={handleDragEnter}
          onDragEnd={handleDragEnd}
          onClick={() => onTaskClick?.({ type: 'queued', title: task.title, id: task.id })}
          onQuickStart={() => onQuickStart?.(task.id)}
        />
      ))}
    </div>
  );
}
