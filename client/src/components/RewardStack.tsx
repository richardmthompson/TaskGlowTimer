import type { Reward } from "../types/reward";
import RewardIcon from "./RewardIcon";

interface RewardStackProps {
  rewards: Reward[];
}

export default function RewardStack({ rewards }: RewardStackProps) {
  if (rewards.length === 0) {
    return null;
  }

  // Calculate diamond count for multi-hour diamonds
  const getDiamondCount = (reward: Reward): number => {
    return reward.minutes / 60;
  };

  return (
    <div className="flex flex-col gap-2 items-center" data-testid="reward-stack">
      {rewards.map((reward, index) => (
        <div
          key={reward.id}
          className="animate-in fade-in slide-in-from-top-2 duration-300"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <RewardIcon
            type={reward.type}
            count={reward.type === 'diamond' ? getDiamondCount(reward) : undefined}
            size="lg"
          />
        </div>
      ))}
    </div>
  );
}
