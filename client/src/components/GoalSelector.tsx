import type { Goal } from "../types/goal";

interface GoalSelectorProps {
  goals: Goal[];
  selectedGoalId: string | null;
  onSelectGoal: (goalId: string | null) => void;
}

export default function GoalSelector({ goals, selectedGoalId, onSelectGoal }: GoalSelectorProps) {
  if (goals.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic">
        Add a goal first
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {goals.map((goal) => (
        <button
          key={goal.id}
          onClick={() => onSelectGoal(goal.id === selectedGoalId ? null : goal.id)}
          className={`px-3 py-1 text-xs font-semibold rounded-md border-thin border-border bg-primary text-primary-foreground shadow-neo-sm hover-elevate active-elevate-2 transition-all ${
            goal.id === selectedGoalId ? 'ring-2 ring-ring' : ''
          }`}
          data-testid={`button-select-goal-${goal.id}`}
        >
          {goal.title}
        </button>
      ))}
      {selectedGoalId && (
        <button
          onClick={() => onSelectGoal(null)}
          className="px-3 py-1 text-xs font-semibold rounded-md border-thin border-border bg-muted text-foreground shadow-neo-sm hover-elevate active-elevate-2"
          data-testid="button-clear-goal"
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
}
