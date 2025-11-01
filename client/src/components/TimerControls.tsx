import { Play, Pause, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimerControlsProps {
  isRunning: boolean;
  onPlayPause: () => void;
  onDone: () => void;
}

export default function TimerControls({
  isRunning,
  onPlayPause,
  onDone,
}: TimerControlsProps) {
  return (
    <div className="flex gap-4 justify-center">
      <Button
        data-testid={isRunning ? "button-pause" : "button-play"}
        size="icon"
        variant="default"
        onClick={onPlayPause}
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 border-blue-700 dark:border-blue-600"
      >
        {isRunning ? (
          <Pause className="w-7 h-7" />
        ) : (
          <Play className="w-7 h-7" />
        )}
      </Button>

      <Button
        data-testid="button-done"
        size="icon"
        variant="default"
        onClick={onDone}
        className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 border-green-700 dark:border-emerald-600"
      >
        <Check className="w-7 h-7" />
      </Button>
    </div>
  );
}
