import { Play, Pause, Check } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  onPlayPause: () => void;
  onDone: () => void;
}

const neoButton =
  "w-12 h-12 flex items-center justify-center rounded-md border-thin " +
  "transition-transform duration-fast ease-neo hover:-translate-x-px hover:-translate-y-px " +
  "hover:shadow-neo-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none " +
  "";

export default function TimerControls({
  isRunning,
  onPlayPause,
  onDone,
}: TimerControlsProps) {
  return (
    <div className="flex gap-4 justify-center">
      <button
        data-testid={isRunning ? "button-pause" : "button-play"}
        onClick={onPlayPause}
        aria-label={isRunning ? "Pause timer" : "Start timer"}
        className={`${neoButton} bg-primary text-primary-foreground`}
      >
        {isRunning ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6" />
        )}
      </button>

      <button
        data-testid="button-done"
        onClick={onDone}
        aria-label="Complete current task"
        className={`${neoButton} panel-hairline bg-transparent text-[hsl(var(--panel-foreground))]`}
      >
        <Check className="w-6 h-6" />
      </button>
    </div>
  );
}
