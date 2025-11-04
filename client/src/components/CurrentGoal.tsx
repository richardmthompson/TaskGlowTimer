import type { Goal } from "../types/goal";

interface CurrentGoalProps {
  goal: Goal | null;
  onClear: () => void;
  backgroundColor?: string;
}

export default function CurrentGoal({ goal, onClear, backgroundColor }: CurrentGoalProps) {
  if (!goal) {
    return (
      <div className="text-xs text-muted-foreground italic text-center">
        No active goal (select from Goals panel)
      </div>
    );
  }

  return (
    <div 
      className="px-3 py-1.5 rounded-lg border-2 flex items-center justify-between"
      style={{
        backgroundColor: backgroundColor || goal.color,
        borderColor: '#d97706',
      }}
      data-testid={`current-goal-${goal.id}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
          Goal:
        </span>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {goal.title}
        </span>
      </div>
      <button
        onClick={onClear}
        className="text-xs font-semibold px-2 py-1 rounded hover-elevate active-elevate-2 bg-black/10 dark:bg-white/20 text-gray-900 dark:text-gray-100"
        data-testid="button-clear-current-goal"
      >
        ✕
      </button>
    </div>
  );
}
