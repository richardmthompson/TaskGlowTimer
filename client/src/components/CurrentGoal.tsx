import type { Goal } from "../types/goal";

interface CurrentGoalProps {
  goal: Goal | null;
  onClear: () => void;
}

export default function CurrentGoal({ goal, onClear }: CurrentGoalProps) {
  if (!goal) {
    return (
      <div className="text-sm font-mono font-bold uppercase tracking-label text-muted-foreground">
        No active goal (select from Goals panel)
      </div>
    );
  }

  return (
    <div
      className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground border-thin border-border shadow-neo-sm flex items-center justify-between"
      data-testid={`current-goal-${goal.id}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-bold uppercase tracking-label">
          Goal:
        </span>
        <span className="text-sm font-semibold">
          {goal.title}
        </span>
      </div>
      <button
        onClick={onClear}
        className="min-h-11 min-w-11 text-xs font-semibold px-2 flex items-center justify-center hover-elevate active-elevate-2"
        aria-label="Clear current goal"
        data-testid="button-clear-current-goal"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}
