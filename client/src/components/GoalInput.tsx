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
      className="w-full h-20 px-3 py-2 rounded-lg border-2 resize-none focus:outline-none focus:ring-2 focus:ring-green-400 text-xs"
      style={{
        backgroundColor: '#d1fae5',
        borderColor: '#10b981',
        color: '#1f2937',
      }}
      data-testid="input-goal"
    />
  );
});

GoalInput.displayName = 'GoalInput';

export default GoalInput;
