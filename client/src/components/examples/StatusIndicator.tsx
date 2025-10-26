import { useState } from "react";
import StatusIndicator from "../StatusIndicator";
import { Button } from "@/components/ui/button";

export default function StatusIndicatorExample() {
  const [isRunning, setIsRunning] = useState(true);

  return (
    <div className="p-8 space-y-4">
      <StatusIndicator isRunning={isRunning} currentTask="Design homepage" />
      <Button onClick={() => setIsRunning(!isRunning)}>
        Toggle Status
      </Button>
    </div>
  );
}
