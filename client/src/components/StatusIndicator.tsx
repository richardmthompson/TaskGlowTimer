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

  if (isRunning) {
    return (
      <div data-testid="text-status-working" className="text-left pl-[25%]">
        <div className="text-foreground font-semibold text-lg">
          Working on{".".repeat(dotCount)}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="text-status-paused" className="text-left pl-[25%] text-muted-foreground text-sm">
      paused
    </div>
  );
}
