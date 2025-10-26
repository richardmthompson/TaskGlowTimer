import { useState, useEffect, useRef } from "react";
import StickyNote from "@/components/StickyNote";
import CircularTimer from "@/components/CircularTimer";
import TimerControls from "@/components/TimerControls";
import CompletedTasksList, { CompletedTaskData } from "@/components/CompletedTasksList";
import SettingsPanel, { ColorSettings } from "@/components/SettingsPanel";
import StatusIndicator from "@/components/StatusIndicator";
import TaskDetailsPanel from "@/components/TaskDetailsPanel";
import QueueInput from "@/components/QueueInput";
import QueuedTasksList, { QueuedTaskData } from "@/components/QueuedTasksList";

export default function Timer() {
  const [currentTask, setCurrentTask] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<CompletedTaskData[]>([]);
  const [queuedTasks, setQueuedTasks] = useState<QueuedTaskData[]>([]);
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<
    | { type: 'completed'; title: string; startTime: string; endTime: string }
    | { type: 'queued'; title: string }
    | null
  >(null);
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

  const handleAddToQueue = (taskTitle: string) => {
    const newTask: QueuedTaskData = {
      id: Date.now().toString(),
      title: taskTitle,
    };
    setQueuedTasks([...queuedTasks, newTask]);
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="w-1/4 p-8">
        <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide text-muted-foreground">
          Completed Today
        </h2>
        <CompletedTasksList
          tasks={completedTasks}
          backgroundColor={colors.completedBackground}
          outlineColor={colors.outline}
          onTaskClick={(task) => setSelectedTask({ ...task, type: 'completed' })}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-[30%] p-8 pb-4 flex justify-end">
          <div className="w-2/3 max-w-2xl">
            <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
              Task Queue
            </h2>
            <div className="flex gap-4 h-[calc(100%-2rem)]">
              <div className="w-48 flex-shrink-0">
                <QueueInput
                  onAddTask={handleAddToQueue}
                  backgroundColor="#dbeafe"
                  outlineColor="#3b82f6"
                />
              </div>
              <div className="flex-1 overflow-y-auto pr-2">
                <QueuedTasksList
                  tasks={queuedTasks}
                  onReorder={setQueuedTasks}
                  backgroundColor="#dbeafe"
                  outlineColor="#3b82f6"
                  onTaskClick={setSelectedTask}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-[70%] p-8 pt-4">
          <div className="flex items-start gap-12">
            <div className="w-80">
              <div className="mb-4">
                <StatusIndicator isRunning={isRunning} currentTask={currentTask} />
              </div>
              <StickyNote
                value={currentTask}
                onChange={setCurrentTask}
                isActive={isRunning}
                backgroundColor={colors.stickyBackground}
                outlineColor={colors.outline}
              />
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
            completedBgColor={colors.completedBackground}
            queuedBgColor="#dbeafe"
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
