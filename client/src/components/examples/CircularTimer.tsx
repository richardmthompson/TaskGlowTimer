import { useState, useEffect } from "react";
import CircularTimer from "../CircularTimer";

export default function CircularTimerExample() {
  const [elapsed, setElapsed] = useState(450);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => (prev + 1) % 1800);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 flex justify-center">
      <CircularTimer
        elapsedSeconds={elapsed}
        totalSeconds={1800}
        defaultColor="#e5e7eb"
        elapsedColor="#3b82f6"
        outlineColor="#d97706"
      />
    </div>
  );
}
