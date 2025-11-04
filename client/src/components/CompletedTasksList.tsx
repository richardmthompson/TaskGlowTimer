import CompletedTask from "./CompletedTask";
import type { RewardSummary } from "../types/reward";
import type { Goal } from "../types/goal";

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
  backgroundColor?: string;
  outlineColor?: string;
  onTaskClick?: (task: CompletedTaskData) => void;
  selectedTaskId?: string | null;
  goals?: Goal[];
  currentGoal?: Goal | null;
}

export default function CompletedTasksList({
  tasks,
  backgroundColor = "#d1fae5",
  outlineColor = "#d97706",
  onTaskClick,
  selectedTaskId,
  goals = [],
  currentGoal = null,
}: CompletedTasksListProps) {
  const getGoalInfo = (goalId: string | null | undefined) => {
    if (!goalId) return { abbreviation: undefined, color: undefined };
    
    const goal = currentGoal?.id === goalId ? currentGoal : goals.find(g => g.id === goalId);
    if (!goal) return { abbreviation: undefined, color: undefined };
    
    return {
      abbreviation: goal.title.substring(0, 3).toUpperCase(),
      color: goal.color,
    };
  };
  if (tasks.length === 0) {
    return (
      <div className="text-muted-foreground text-sm text-left py-8">
        No completed tasks yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-w-[300px]">
      {tasks.map((task) => {
        const goalInfo = getGoalInfo(task.goalId);
        return (
          <CompletedTask
            key={task.id}
            id={task.id}
            title={task.title}
            startTime={task.startTime}
            endTime={task.endTime}
            backgroundColor={backgroundColor}
            outlineColor={outlineColor}
            onClick={() => onTaskClick?.(task)}
            isSelected={selectedTaskId === task.id}
            rewards={task.rewards}
            goalAbbreviation={goalInfo.abbreviation}
            goalColor={goalInfo.color}
          />
        );
      })}
    </div>
  );
}
