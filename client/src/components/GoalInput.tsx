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
        e.currentTarget.blur();
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
      className="w-full h-20 px-3 py-2 resize-none rounded-md text-xs font-bold bg-primary text-primary-foreground placeholder:text-primary-foreground/60 dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground dark:border-input border-thin border-border shadow-neo-sm"
      data-testid="input-goal"
    />
  );
});

GoalInput.displayName = 'GoalInput';

export default GoalInput;
