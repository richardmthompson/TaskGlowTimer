import { useState, useEffect, useRef, useCallback } from "react";
import StickyNote from "@/components/StickyNote";
import CircularTimer from "@/components/CircularTimer";
import TimerControls from "@/components/TimerControls";
import CompletedTasksList, { CompletedTaskData } from "@/components/CompletedTasksList";
import SettingsPanel, { ColorSettings } from "@/components/SettingsPanel";
import HelpPanel from "@/components/HelpPanel";
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
    | { type: 'queued'; title: string; id: string }
    | null
  >(null);
  const [selectedQueuedTaskId, setSelectedQueuedTaskId] = useState<string | null>(null);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);
  const [showStickyError, setShowStickyError] = useState(false);

  const [colors, setColors] = useState<ColorSettings>({
    stickyBackground: "#fef3c7",
    completedBackground: "#d1fae5",
    clockDefault: "#e5e7eb",
    clockElapsed: "#3b82f6",
    outline: "#d97706",
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stickyNoteRef = useRef<HTMLTextAreaElement>(null);
  const queueInputRef = useRef<HTMLTextAreaElement>(null);

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

  const handlePlayPause = useCallback(() => {
    if (!isRunning && !taskStartTime) {
      setTaskStartTime(new Date());
    }
    setIsRunning(!isRunning);
  }, [isRunning, taskStartTime]);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const handleDone = useCallback(() => {
    if (currentTask.trim()) {
      const endTime = new Date();
      const startTime = taskStartTime || endTime;
      const newTask: CompletedTaskData = {
        id: Date.now().toString(),
        title: currentTask,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
      };

      setCompletedTasks((prev) => [...prev, newTask]);
      setCurrentTask("");
      setElapsedSeconds(0);
      setIsRunning(false);
      setTaskStartTime(null);
    }
  }, [currentTask, taskStartTime]);

  const handleAddToQueue = (taskTitle: string) => {
    const newTask: QueuedTaskData = {
      id: Date.now().toString(),
      title: taskTitle,
    };
    setQueuedTasks([...queuedTasks, newTask]);
  };

  const handleQuickStart = (taskId: string) => {
    const task = queuedTasks.find(t => t.id === taskId);
    if (task) {
      if (currentTask.trim()) {
        // Show error: sticky note already has content
        setShowStickyError(true);
        setTimeout(() => setShowStickyError(false), 500);
        return;
      }
      setCurrentTask(task.title);
      setQueuedTasks(queuedTasks.filter(t => t.id !== taskId));
      setSelectedQueuedTaskId(null);
      setSelectedTask(null);
    }
  };

  const handleQueuedTaskClick = (task: { type: 'queued'; title: string; id: string }) => {
    setSelectedQueuedTaskId(task.id);
    setSelectedTask(task);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'TEXTAREA' || activeElement?.tagName === 'INPUT';

      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleDone();
        return;
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        if (activeElement?.tagName === 'TEXTAREA' || activeElement?.tagName === 'INPUT') {
          (activeElement as HTMLElement).blur();
        }
        setSelectedTask(null);
        setSelectedQueuedTaskId(null);
        return;
      }

      if (e.key === 't' && !isInputFocused) {
        e.preventDefault();
        stickyNoteRef.current?.focus();
      }
      
      else if (e.key === 'q' && !isInputFocused) {
        e.preventDefault();
        queueInputRef.current?.focus();
      }
      
      else if (e.key === 'Enter' && !isInputFocused && selectedTask?.type === 'queued' && selectedQueuedTaskId) {
        e.preventDefault();
        handleQuickStart(selectedQueuedTaskId);
      }
      
      else if (e.key === 'd' && !isInputFocused && selectedTask) {
        e.preventDefault();
        if (selectedTask.type === 'completed') {
          setCompletedTasks(prev => prev.filter(t => !(t.title === selectedTask.title && t.startTime === selectedTask.startTime)));
          setSelectedTask(null);
        } else if (selectedTask.type === 'queued' && selectedQueuedTaskId) {
          setQueuedTasks(prev => prev.filter(t => t.id !== selectedQueuedTaskId));
          setSelectedQueuedTaskId(null);
          setSelectedTask(null);
        }
      }
      
      else if (e.key === 'T' && !isInputFocused && selectedTask?.type === 'completed') {
        e.preventDefault();
        if (currentTask.trim()) {
          setShowStickyError(true);
          setTimeout(() => setShowStickyError(false), 500);
          return;
        }
        setCurrentTask(selectedTask.title);
        setCompletedTasks(prev => prev.filter(t => !(t.title === selectedTask.title && t.startTime === selectedTask.startTime)));
        setSelectedTask(null);
      }
      
      else if (e.key === ' ' && !isInputFocused) {
        e.preventDefault();
        handlePlayPause();
      }
      
      else if (e.key === 'c' && !isInputFocused) {
        e.preventDefault();
        if (completedTasks.length > 0) {
          const firstTask = completedTasks[0];
          setSelectedTask({ ...firstTask, type: 'completed' });
          setSelectedQueuedTaskId(null);
        }
      }
      
      else if (e.key === 'Q' && !isInputFocused) {
        e.preventDefault();
        if (queuedTasks.length > 0) {
          const firstTask = queuedTasks[0];
          setSelectedQueuedTaskId(firstTask.id);
          setSelectedTask({ type: 'queued', title: firstTask.title, id: firstTask.id });
        }
      }
      
      else if ((e.key === 'ArrowDown' || e.key === 'j') && !isInputFocused) {
        e.preventDefault();
        if (selectedTask?.type === 'completed') {
          const currentIndex = completedTasks.findIndex(t => t.title === selectedTask.title && t.startTime === selectedTask.startTime);
          if (currentIndex < completedTasks.length - 1) {
            const nextTask = completedTasks[currentIndex + 1];
            setSelectedTask({ ...nextTask, type: 'completed' });
          }
        } else if (selectedTask?.type === 'queued' && selectedQueuedTaskId) {
          const currentIndex = queuedTasks.findIndex(t => t.id === selectedQueuedTaskId);
          if (currentIndex < queuedTasks.length - 1) {
            const nextTask = queuedTasks[currentIndex + 1];
            setSelectedQueuedTaskId(nextTask.id);
            setSelectedTask({ type: 'queued', title: nextTask.title, id: nextTask.id });
          }
        }
      }
      
      else if ((e.key === 'ArrowUp' || e.key === 'k') && !isInputFocused) {
        e.preventDefault();
        if (selectedTask?.type === 'completed') {
          const currentIndex = completedTasks.findIndex(t => t.title === selectedTask.title && t.startTime === selectedTask.startTime);
          if (currentIndex > 0) {
            const prevTask = completedTasks[currentIndex - 1];
            setSelectedTask({ ...prevTask, type: 'completed' });
          }
        } else if (selectedTask?.type === 'queued' && selectedQueuedTaskId) {
          const currentIndex = queuedTasks.findIndex(t => t.id === selectedQueuedTaskId);
          if (currentIndex > 0) {
            const prevTask = queuedTasks[currentIndex - 1];
            setSelectedQueuedTaskId(prevTask.id);
            setSelectedTask({ type: 'queued', title: prevTask.title, id: prevTask.id });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, completedTasks, queuedTasks, selectedTask, selectedQueuedTaskId, handleDone, handlePlayPause]);

  return (
    <div className="flex justify-center h-screen bg-background">
      <div className="flex max-w-[1600px] w-full">
        <div className="w-[28%] p-8 flex flex-col items-end">
        <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide text-muted-foreground self-stretch">
          Completed Today
        </h2>
        <CompletedTasksList
          tasks={completedTasks}
          backgroundColor={colors.completedBackground}
          outlineColor={colors.outline}
          onTaskClick={(task) => {
            setSelectedTask({ ...task, type: 'completed' });
            setSelectedQueuedTaskId(null);
          }}
          selectedTaskId={selectedTask?.type === 'completed' ? completedTasks.find(t => t.title === selectedTask.title && t.startTime === selectedTask.startTime)?.id : null}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-[35%] p-8 pb-4">
          <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
            Task Queue
          </h2>
          <div className="flex gap-4 h-[calc(100%-2rem)]">
            <div className="w-48 flex-shrink-0">
              <QueueInput
                ref={queueInputRef}
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
                selectedTaskId={selectedQueuedTaskId}
                onTaskClick={handleQueuedTaskClick}
                onQuickStart={handleQuickStart}
              />
            </div>
          </div>
        </div>

        <div className="h-[65%] p-8 pt-4">
          <div className="flex items-start gap-6">
            <div className="w-80">
              <div className="mb-4">
                <StatusIndicator isRunning={isRunning} currentTask={currentTask} />
              </div>
              <StickyNote
                ref={stickyNoteRef}
                value={currentTask}
                onChange={setCurrentTask}
                isActive={isRunning}
                backgroundColor={colors.stickyBackground}
                outlineColor={colors.outline}
                onEnterKey={handlePlayPause}
                showError={showStickyError}
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

      <HelpPanel
        isExpanded={isHelpExpanded}
        onToggle={() => setIsHelpExpanded(!isHelpExpanded)}
      />

      <SettingsPanel
        colors={colors}
        onChange={setColors}
        isExpanded={isSettingsExpanded}
        onToggle={() => setIsSettingsExpanded(!isSettingsExpanded)}
      />
      </div>
    </div>
  );
}
