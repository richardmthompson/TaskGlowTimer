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
      className={`w-full text-left px-4 py-3 rounded-lg border-2 hover-elevate active-elevate-2 transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-400 shadow-lg' : ''
      }`}
      style={{
        backgroundColor: goal.color,
        borderColor: '#d97706',
      }}
      data-testid={`card-goal-${goal.id}`}
    >
      <div className="text-sm font-semibold truncate" style={{ color: "#1f2937" }}>
        {goal.title}
      </div>
    </button>
  );
}
