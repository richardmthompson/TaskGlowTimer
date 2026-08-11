import type { RewardSummary } from "../types/reward";
import TaskRewards from "./TaskRewards";

interface CompletedTaskProps {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  onClick?: () => void;
  isSelected?: boolean;
  rewards?: RewardSummary;
  goalAbbreviation?: string;
}

export default function CompletedTask({
  id,
  title,
  startTime,
  endTime,
  onClick,
  isSelected = false,
  rewards,
  goalAbbreviation,
}: CompletedTaskProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full min-h-11 text-left relative pl-16 pr-4 py-3 rounded-card bg-card text-card-foreground border-thin hover-elevate active-elevate-2 transition-transform duration-fast ease-neo ${
        isSelected
          ? "border-primary neo-selected"
          : "border-border shadow-neo-sm"
      }`}
      data-testid={`card-task-${id}`}
    >
      <div className="absolute left-2 top-2 text-xs font-mono text-muted-foreground">
        {startTime}
      </div>

      <div className="absolute left-2 bottom-2 text-xs font-mono text-muted-foreground">
        {endTime}
      </div>

      <div className="absolute left-14 top-0 bottom-0 w-0.5 bg-border" />

      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-bold truncate text-card-foreground flex-1">
          {title}
        </div>
        <div className="flex items-center gap-2">
          {goalAbbreviation && (
            <div className="px-1.5 py-0.5 text-[10px] font-mono font-black tracking-label rounded-md bg-primary text-primary-foreground border-thin border-border">
              {goalAbbreviation}
            </div>
          )}
          <TaskRewards rewards={rewards} />
        </div>
      </div>
    </button>
  );
}
