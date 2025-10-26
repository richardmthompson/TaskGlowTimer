import { useState } from "react";
import QueueInput from "../QueueInput";

export default function QueueInputExample() {
  const [tasks, setTasks] = useState<string[]>([]);

  return (
    <div className="p-8 max-w-sm space-y-4">
      <QueueInput
        onAddTask={(task) => {
          setTasks([...tasks, task]);
          console.log("Task added:", task);
        }}
        backgroundColor="#dbeafe"
        outlineColor="#3b82f6"
      />
      {tasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Added tasks:</h3>
          {tasks.map((task, i) => (
            <div key={i} className="text-sm">
              {i + 1}. {task}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
