import { useState } from "react";
import TaskDetailsPanel from "../TaskDetailsPanel";
import { Button } from "@/components/ui/button";

export default function TaskDetailsPanelExample() {
  const [task, setTask] = useState({
    title: "Design homepage mockups and create initial wireframes",
    startTime: "08:30",
    endTime: "09:15",
  });
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="p-8 max-w-2xl">
      {!isVisible && (
        <Button onClick={() => setIsVisible(true)}>Show Task Details</Button>
      )}
      <TaskDetailsPanel
        task={isVisible ? task : null}
        onClose={() => setIsVisible(false)}
        backgroundColor="#d1fae5"
        outlineColor="#d97706"
      />
    </div>
  );
}
