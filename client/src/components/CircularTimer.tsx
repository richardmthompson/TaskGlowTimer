interface CircularTimerProps {
  elapsedSeconds: number;
  totalSeconds: number;
  isRunning?: boolean;
}

export default function CircularTimer({
  elapsedSeconds,
  totalSeconds = 1800,
  isRunning = false,
}: CircularTimerProps) {
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(elapsedSeconds / totalSeconds, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* Radar ping: the app's ONE active/now marker, only while running.
          Violet rings, staggered thirds; hidden under prefers-reduced-motion. */}
      {isRunning && (
        <>
          <div className="radar-ring" aria-hidden="true" />
          <div className="radar-ring" style={{ animationDelay: "-1.07s" }} aria-hidden="true" />
          <div className="radar-ring" style={{ animationDelay: "-2.13s" }} aria-hidden="true" />
        </>
      )}
      <svg
        className="transform -rotate-90"
        width="160"
        height="160"
        viewBox="0 0 160 160"
      >
        {/* Default track: muted. Elapsed arc: violet (the one accent). */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="hsl(var(--panel-foreground) / 0.15)"
          strokeWidth="7"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="motion-safe:transition-all motion-safe:duration-1000 ease-linear"
        />
        {/* Heavy neo ring: theme border color, the timer's square exception is that it stays a circle. */}
        <circle
          cx="80"
          cy="80"
          r={radius + 3}
          fill="none"
          stroke="hsl(var(--panel-foreground) / 0.35)"
          strokeWidth="2.5"
        />
      </svg>

      <div
        data-testid="text-timer-display"
        className="absolute inset-0 flex items-center justify-center text-2xl font-mono font-bold text-primary"
      >
        {timeString}
      </div>
    </div>
  );
}
