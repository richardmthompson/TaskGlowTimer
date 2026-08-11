import CompletedTask from "./CompletedTask";
import type { RewardSummary } from "../types/reward";
import type { Goal } from "../types/goal";
import { EmptyState } from "./ui/EmptyState";

export interface CompletedTaskData {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  goalId?: string | null;
  rewards?: RewardSummary;
}

interface CompletedTasksListProps {
  tasks: CompletedTaskData[];
  onTaskClick?: (task: CompletedTaskData) => void;
  selectedTaskId?: string | null;
  goals?: Goal[];
  currentGoal?: Goal | null;
}

export default function CompletedTasksList({
  tasks,
  onTaskClick,
  selectedTaskId,
  goals = [],
  currentGoal = null,
}: CompletedTasksListProps) {
  const getGoalAbbreviation = (goalId: string | null | undefined) => {
    if (!goalId) return undefined;
    const goal = currentGoal?.id === goalId ? currentGoal : goals.find(g => g.id === goalId);
    if (!goal) return undefined;
    return goal.title.substring(0, 3).toUpperCase();
  };

  if (tasks.length === 0) {
    return (
      <EmptyState
        headline="Nothing banked yet"
        hint={<>finish a task on the clock<br />and it lands here</>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 max-w-[300px]">
      {tasks.map((task) => (
        <CompletedTask
          key={task.id}
          id={task.id}
          title={task.title}
          startTime={task.startTime}
          endTime={task.endTime}
          onClick={() => onTaskClick?.(task)}
          isSelected={selectedTaskId === task.id}
          rewards={task.rewards}
          goalAbbreviation={getGoalAbbreviation(task.goalId)}
        />
      ))}
    </div>
  );
}
