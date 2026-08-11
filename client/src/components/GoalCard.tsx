import type { Goal } from "../types/goal";

interface GoalCardProps {
  goal: Goal;
  onClick?: () => void;
  onPromote?: () => void;
  isSelected?: boolean;
}

export default function GoalCard({ goal, onClick, onPromote, isSelected = false }: GoalCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' && isSelected && onPromote) {
      e.preventDefault();
      onPromote();
    }
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`w-full min-h-11 text-left px-4 py-3 rounded-card bg-primary text-primary-foreground border-thin dark:bg-card dark:text-card-foreground hover-elevate active-elevate-2 transition-transform duration-fast ease-neo ${
        isSelected
          ? "border-foreground dark:border-primary dark:text-primary neo-selected"
          : "border-border shadow-neo-sm"
      }`}
      data-testid={`card-goal-${goal.id}`}
    >
      <div className="text-sm font-bold truncate">
        {goal.title}
      </div>
    </button>
  );
}
