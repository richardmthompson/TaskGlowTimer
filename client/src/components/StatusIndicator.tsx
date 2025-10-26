import { useEffect, useState } from "react";

interface StatusIndicatorProps {
  isRunning: boolean;
  currentTask: string;
}

export default function StatusIndicator({ isRunning, currentTask }: StatusIndicatorProps) {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setDotCount((prev) => (prev % 3) + 1);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  return (
    <div className="text-left pl-[25%]">
      <div className="inline-block min-w-[140px]">
        {isRunning ? (
          <div data-testid="text-status-working" className="text-foreground font-medium text-base">
            Working on{".".repeat(dotCount)}
          </div>
        ) : (
          <div data-testid="text-status-paused" className="text-muted-foreground text-base">
            paused
          </div>
        )}
      </div>
    </div>
  );
}
