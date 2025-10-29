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
      <div className="text-muted-foreground text-sm text-left py-8">
        No goals yet
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
