import { useState, KeyboardEvent } from "react";

interface QueueInputProps {
  onAddTask: (task: string) => void;
  backgroundColor?: string;
  outlineColor?: string;
}

export default function QueueInput({
  onAddTask,
  backgroundColor = "#dbeafe",
  outlineColor = "#3b82f6",
}: QueueInputProps) {
  const [value, setValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onAddTask(value.trim());
        setValue("");
      }
    }
  };

  return (
    <div className="relative">
      <textarea
        data-testid="input-queue-task"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add an item to the queue"
        className="w-full h-16 px-3 py-2 text-sm font-medium rounded-lg border-2 resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
        style={{
          backgroundColor,
          borderColor: outlineColor,
          color: "#1f2937",
        }}
      />
    </div>
  );
}
