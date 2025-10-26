import { useState } from "react";
import TimerControls from "../TimerControls";

export default function TimerControlsExample() {
  const [isRunning, setIsRunning] = useState(false);

  return (
    <div className="p-8">
      <TimerControls
        isRunning={isRunning}
        onPlayPause={() => {
          setIsRunning(!isRunning);
          console.log(isRunning ? "Paused" : "Playing");
        }}
        onDone={() => console.log("Task completed!")}
      />
    </div>
  );
}
