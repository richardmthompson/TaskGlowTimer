import { useState, useRef } from "react";
import QueuedTask from "./QueuedTask";
import { GripVertical } from "lucide-react";

export interface QueuedTaskData {
  id: string;
  title: string;
  goalId?: string | null;
}

interface QueuedTasksListProps {
  tasks: QueuedTaskData[];
  onReorder: (tasks: QueuedTaskData[]) => void;
  backgroundColor?: string;
  outlineColor?: string;
  selectedTaskId?: string | null;
  onTaskClick?: (task: { type: 'queued'; title: string; id: string }) => void;
  onQuickStart?: (taskId: string) => void;
}

export default function QueuedTasksList({
  tasks,
  onReorder,
  backgroundColor = "#dbeafe",
  outlineColor = "#3b82f6",
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
        <div
          className="flex items-center gap-2 py-2 px-3 rounded-lg border-2 opacity-40"
          style={{
            backgroundColor,
            borderColor: outlineColor,
          }}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="text-sm font-bold flex-1 text-gray-800 dark:text-gray-300 italic">
            No queued tasks
          </div>
        </div>
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
          backgroundColor={backgroundColor}
          outlineColor={outlineColor}
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
