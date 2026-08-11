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
        {/* Medal earns the violet primary accent (the one locked accent). */}
        <Award className={`${iconSize} text-primary fill-primary`} />
      </div>
    );
  }

  // Diamond: the demoted mint highlight (deep mint in light, bright mint in dark).
  return (
    <div
      className="relative flex items-center justify-center"
      data-testid="reward-diamond"
    >
      <Diamond className={`${iconSize} text-accent fill-accent`} />
      {count !== undefined && count > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-mono font-bold text-accent-foreground"
            style={{ fontSize: size === 'sm' ? '0.5rem' : size === 'md' ? '0.625rem' : '0.75rem' }}
          >
            {count}
          </span>
        </div>
      )}
    </div>
  );
}
