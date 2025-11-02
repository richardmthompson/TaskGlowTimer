import { useState, KeyboardEvent, forwardRef } from "react";

interface QueueInputProps {
  onAddTask: (task: string) => void;
  backgroundColor?: string;
  outlineColor?: string;
}

const QueueInput = forwardRef<HTMLTextAreaElement, QueueInputProps>(({
  onAddTask,
  backgroundColor = "#dbeafe",
  outlineColor = "#3b82f6",
}, ref) => {
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
        ref={ref}
        data-testid="input-queue-task"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add an item to the queue"
        className="w-full h-16 px-3 py-2 text-sm font-bold rounded-lg border-2 resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-gray-800 dark:text-gray-300"
        style={{
          backgroundColor,
          borderColor: outlineColor,
        }}
      />
    </div>
  );
});

QueueInput.displayName = "QueueInput";

export default QueueInput;
