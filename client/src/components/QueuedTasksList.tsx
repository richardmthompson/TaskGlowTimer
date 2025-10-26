import { useState, useRef } from "react";
import QueuedTask from "./QueuedTask";

export interface QueuedTaskData {
  id: string;
  title: string;
}

interface QueuedTasksListProps {
  tasks: QueuedTaskData[];
  onReorder: (tasks: QueuedTaskData[]) => void;
  backgroundColor?: string;
  outlineColor?: string;
}

export default function QueuedTasksList({
  tasks,
  onReorder,
  backgroundColor = "#dbeafe",
  outlineColor = "#3b82f6",
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
      <div className="text-muted-foreground text-sm text-left py-4">
        No queued tasks
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
          onDragStart={handleDragStart}
          onDragEnter={handleDragEnter}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  );
}
