import { useState, forwardRef } from "react";

interface GoalInputProps {
  onAddGoal: (title: string) => void;
  backgroundColor?: string;
  outlineColor?: string;
}

const GoalInput = forwardRef<HTMLTextAreaElement, GoalInputProps>(({ onAddGoal, backgroundColor = '#fed7aa', outlineColor = '#d97706' }, ref) => {
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
      className="w-full h-20 px-3 py-2 rounded-lg border-2 resize-none focus:outline-none focus:ring-2 text-xs"
      style={{
        backgroundColor: backgroundColor,
        borderColor: outlineColor,
        color: '#1f2937',
        boxShadow: `0 0 0 2px transparent`,
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 2px ${outlineColor}40`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 2px transparent`;
      }}
      data-testid="input-goal"
    />
  );
});

GoalInput.displayName = 'GoalInput';

export default GoalInput;
