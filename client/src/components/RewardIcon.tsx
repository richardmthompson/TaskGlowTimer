import { Award, Diamond } from "lucide-react";

interface RewardIconProps {
  type: 'medal' | 'diamond';
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function RewardIcon({ type, count, size = 'md' }: RewardIconProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const iconSize = sizeClasses[size];

  if (type === 'medal') {
    return (
      <div
        className="relative flex items-center justify-center"
        data-testid="reward-medal"
      >
        <Award className={`${iconSize} text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400`} />
      </div>
    );
  }

  // Diamond
  return (
    <div
      className="relative flex items-center justify-center"
      data-testid="reward-diamond"
    >
      <Diamond className={`${iconSize} text-purple-500 dark:text-purple-400 fill-purple-500 dark:fill-purple-400`} />
      {count !== undefined && count > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white dark:text-gray-900" style={{ fontSize: size === 'sm' ? '0.5rem' : size === 'md' ? '0.625rem' : '0.75rem' }}>
            {count}
          </span>
        </div>
      )}
    </div>
  );
}
