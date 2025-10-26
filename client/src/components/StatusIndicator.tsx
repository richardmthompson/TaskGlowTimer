import { useEffect, useState } from "react";

interface StatusIndicatorProps {
  isRunning: boolean;
}

export default function StatusIndicator({ isRunning }: StatusIndicatorProps) {
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
      <div data-testid="text-status-working" className="text-center text-foreground font-medium">
        Working{".".repeat(dotCount)}
      </div>
    );
  }

  return (
    <div data-testid="text-status-paused" className="text-center text-muted-foreground text-sm">
      paused
    </div>
  );
}
