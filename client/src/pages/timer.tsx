import { useState, useEffect, useRef } from "react";
import StickyNote from "@/components/StickyNote";
import CircularTimer from "@/components/CircularTimer";
import TimerControls from "@/components/TimerControls";
import CompletedTasksList, { CompletedTaskData } from "@/components/CompletedTasksList";
import SettingsPanel, { ColorSettings } from "@/components/SettingsPanel";
import StatusIndicator from "@/components/StatusIndicator";
import TaskDetailsPanel from "@/components/TaskDetailsPanel";

export default function Timer() {
  const [currentTask, setCurrentTask] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<CompletedTaskData[]>([]);
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<CompletedTaskData | null>(null);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  const [colors, setColors] = useState<ColorSettings>({
    stickyBackground: "#fef3c7",
    completedBackground: "#d1fae5",
    clockDefault: "#e5e7eb",
    clockElapsed: "#3b82f6",
    outline: "#d97706",
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handlePlayPause = () => {
    if (!isRunning && !taskStartTime) {
      setTaskStartTime(new Date());
    }
    setIsRunning(!isRunning);
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const handleDone = () => {
    if (currentTask.trim() && taskStartTime) {
      const endTime = new Date();
      const newTask: CompletedTaskData = {
        id: Date.now().toString(),
        title: currentTask,
        startTime: formatTime(taskStartTime),
        endTime: formatTime(endTime),
      };

      setCompletedTasks([...completedTasks, newTask]);
      setCurrentTask("");
      setElapsedSeconds(0);
      setIsRunning(false);
      setTaskStartTime(null);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="w-1/3 p-8">
        <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide text-muted-foreground">
          Completed Today
        </h2>
        <CompletedTasksList
          tasks={completedTasks}
          backgroundColor={colors.completedBackground}
          outlineColor={colors.outline}
          onTaskClick={setSelectedTask}
        />
      </div>

      <div className="flex-1 flex items-center p-8">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex items-start justify-start gap-12 mb-6">
            <div className="w-80">
              <StickyNote
                value={currentTask}
                onChange={setCurrentTask}
                isActive={isRunning}
                backgroundColor={colors.stickyBackground}
                outlineColor={colors.outline}
              />
              <div className="mt-4">
                <StatusIndicator isRunning={isRunning} currentTask={currentTask} />
              </div>
              <TimerControls
                isRunning={isRunning}
                onPlayPause={handlePlayPause}
                onDone={handleDone}
              />
            </div>

            <div>
              <CircularTimer
                elapsedSeconds={elapsedSeconds}
                totalSeconds={1800}
                defaultColor={colors.clockDefault}
                elapsedColor={colors.clockElapsed}
                outlineColor={colors.outline}
              />
            </div>
          </div>

          <TaskDetailsPanel
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            backgroundColor={colors.completedBackground}
            outlineColor={colors.outline}
          />
        </div>
      </div>

      <SettingsPanel
        colors={colors}
        onChange={setColors}
        isExpanded={isSettingsExpanded}
        onToggle={() => setIsSettingsExpanded(!isSettingsExpanded)}
      />
    </div>
  );
}
