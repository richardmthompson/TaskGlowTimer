import { useState, KeyboardEvent, forwardRef } from "react";

interface QueueInputProps {
  onAddTask: (task: string) => void;
}

const QueueInput = forwardRef<HTMLTextAreaElement, QueueInputProps>(({ onAddTask }, ref) => {
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
        className="w-full h-16 px-3 py-2 rounded-md text-sm font-bold resize-none bg-muted text-foreground placeholder:text-muted-foreground border-thin border-border shadow-neo-sm"
      />
    </div>
  );
});

QueueInput.displayName = "QueueInput";

export default QueueInput;
