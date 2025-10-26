import { useState } from "react";
import StickyNote from "../StickyNote";

export default function StickyNoteExample() {
  const [task, setTask] = useState("Design the new homepage");
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="p-8">
      <StickyNote
        value={task}
        onChange={setTask}
        isActive={isActive}
        backgroundColor="#fef3c7"
        outlineColor="#d97706"
      />
      <button
        onClick={() => setIsActive(!isActive)}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Toggle Active
      </button>
    </div>
  );
}
