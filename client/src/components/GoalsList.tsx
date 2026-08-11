import type { Goal } from "../types/goal";
import GoalCard from "./GoalCard";

interface GoalsListProps {
  goals: Goal[];
  onGoalClick?: (goal: Goal) => void;
  onPromote?: (goal: Goal) => void;
  selectedGoalId?: string | null;
}

export default function GoalsList({ goals, onGoalClick, onPromote, selectedGoalId }: GoalsListProps) {
  if (goals.length === 0) {
    return (
      <div className="py-6 font-mono text-[10px] uppercase tracking-label text-muted-foreground leading-relaxed">
        <div className="font-bold">Empty stack</div>
        <div className="mt-2">press <kbd className="px-1.5 py-0.5 rounded-code border-thin border-border bg-card shadow-neo-sm font-bold text-foreground">G</kbd> · add a goal</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-8rem)] pr-2 max-w-[200px]">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onClick={() => onGoalClick?.(goal)}
          onPromote={() => onPromote?.(goal)}
          isSelected={selectedGoalId === goal.id}
        />
      ))}
    </div>
  );
}
