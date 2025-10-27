import { useState, forwardRef } from "react";

interface GoalInputProps {
  onAddGoal: (title: string) => void;
}

const GoalInput = forwardRef<HTMLTextAreaElement, GoalInputProps>(({ onAddGoal }, ref) => {
  const [value, setValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onAddGoal(value.trim());
        setValue("");
      }
    }
  };

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Add a goal..."
      className="w-full h-full px-4 py-3 rounded-lg border-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
      style={{
        backgroundColor: '#e0f2fe',
        borderColor: '#3b82f6',
        color: '#1f2937',
      }}
      data-testid="input-goal"
    />
  );
});

GoalInput.displayName = 'GoalInput';

export default GoalInput;
