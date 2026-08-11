import type { RewardSummary } from "../types/reward";
import RewardIcon from "./RewardIcon";

interface TaskRewardsProps {
  rewards?: RewardSummary;
}

export default function TaskRewards({ rewards }: TaskRewardsProps) {
  if (!rewards || rewards.totalMinutes === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 ml-2" data-testid="task-rewards">
      {rewards.diamonds > 0 && (
        <div className="flex items-center">
          <RewardIcon type="diamond" count={rewards.diamonds} size="sm" />
        </div>
      )}
      {rewards.medals > 0 && (
        <div className="flex items-center">
          <RewardIcon type="medal" size="sm" />
          {rewards.medals > 1 && (
            <span className="text-xs font-mono font-bold ml-0.5 text-foreground">
              ×{rewards.medals}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
