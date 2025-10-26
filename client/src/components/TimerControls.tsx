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
    <div className="flex gap-4 justify-center mt-6">
      <Button
        data-testid={isRunning ? "button-pause" : "button-play"}
        size="icon"
        variant="default"
        onClick={onPlayPause}
        className="w-16 h-16 rounded-full"
      >
        {isRunning ? (
          <Pause className="w-8 h-8" />
        ) : (
          <Play className="w-8 h-8" />
        )}
      </Button>

      <Button
        data-testid="button-done"
        size="icon"
        variant="default"
        onClick={onDone}
        className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 border-green-700"
      >
        <Check className="w-8 h-8" />
      </Button>
    </div>
  );
}
