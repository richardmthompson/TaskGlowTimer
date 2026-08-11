import type { Goal } from "../types/goal";
import GoalCard from "./GoalCard";
import { EmptyState } from "./ui/EmptyState";
import { Kbd } from "./ui/Kbd";

interface GoalsListProps {
  goals: Goal[];
  onGoalClick?: (goal: Goal) => void;
  onPromote?: (goal: Goal) => void;
  selectedGoalId?: string | null;
}

export default function GoalsList({ goals, onGoalClick, onPromote, selectedGoalId }: GoalsListProps) {
  if (goals.length === 0) {
    return (
      <EmptyState
        headline="Empty stack"
        hint={<>press <Kbd className="font-bold">G</Kbd> · add a goal</>}
      />
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
