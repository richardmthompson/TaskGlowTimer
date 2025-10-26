import { useState } from "react";
import QueuedTasksList, { QueuedTaskData } from "../QueuedTasksList";

export default function QueuedTasksListExample() {
  const [tasks, setTasks] = useState<QueuedTaskData[]>([
    { id: "1", title: "Review pull requests" },
    { id: "2", title: "Update documentation" },
    { id: "3", title: "Fix navigation bug" },
    { id: "4", title: "Team meeting prep" },
  ]);

  return (
    <div className="p-8 max-w-sm">
      <h2 className="text-lg font-semibold mb-4">Queue (Drag to Reorder)</h2>
      <QueuedTasksList
        tasks={tasks}
        onReorder={(newTasks) => {
          setTasks(newTasks);
          console.log("Reordered:", newTasks.map((t) => t.title));
        }}
        backgroundColor="#dbeafe"
        outlineColor="#3b82f6"
      />
    </div>
  );
}
