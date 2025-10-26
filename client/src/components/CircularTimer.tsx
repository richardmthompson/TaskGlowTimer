interface CircularTimerProps {
  elapsedSeconds: number;
  totalSeconds: number;
  defaultColor?: string;
  elapsedColor?: string;
  outlineColor?: string;
}

export default function CircularTimer({
  elapsedSeconds,
  totalSeconds = 1800,
  defaultColor = "#e5e7eb",
  elapsedColor = "#3b82f6",
  outlineColor = "#d97706",
}: CircularTimerProps) {
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(elapsedSeconds / totalSeconds, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width="192"
        height="192"
        viewBox="0 0 192 192"
      >
        <circle
          cx="96"
          cy="96"
          r={radius}
          fill="none"
          stroke={defaultColor}
          strokeWidth="8"
        />
        <circle
          cx="96"
          cy="96"
          r={radius}
          fill="none"
          stroke={elapsedColor}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
        />
        <circle
          cx="96"
          cy="96"
          r={radius + 4}
          fill="none"
          stroke={outlineColor}
          strokeWidth="4"
        />
      </svg>

      <div
        data-testid="text-timer-display"
        className="absolute inset-0 flex items-center justify-center text-4xl font-mono font-bold"
        style={{ color: "#1f2937" }}
      >
        {timeString}
      </div>
    </div>
  );
}
