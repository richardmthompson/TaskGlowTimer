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
import GoalInput from "@/components/GoalInput";
import GoalsList from "@/components/GoalsList";
import GoalTaskConnections from "@/components/GoalTaskConnections";
import CurrentGoal from "@/components/CurrentGoal";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Goal } from "../types/goal";

export default function Timer() {
  const [currentTask, setCurrentTask] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<CompletedTaskData[]>([]);
  const [queuedTasks, setQueuedTasks] = useState<QueuedTaskData[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [selectedGoalInStack, setSelectedGoalInStack] = useState<string | null>(null);
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
    goalBackground: "#fed7aa",
    clockDefault: "#e5e7eb",
    clockElapsed: "#3b82f6",
    outline: "#d97706",
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stickyNoteRef = useRef<HTMLTextAreaElement>(null);
  const queueInputRef = useRef<HTMLTextAreaElement>(null);
  const goalInputRef = useRef<HTMLTextAreaElement>(null);

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
        goalId: currentGoal?.id || null,
      };

      setCompletedTasks((prev) => [...prev, newTask]);
      setCurrentTask("");
      setElapsedSeconds(0);
      setIsRunning(false);
      setTaskStartTime(null);
    }
  }, [currentTask, taskStartTime, currentGoal]);

  const handleAddToQueue = (taskTitle: string) => {
    const newTask: QueuedTaskData = {
      id: Date.now().toString(),
      title: taskTitle,
      goalId: currentGoal?.id || null,
    };
    setQueuedTasks([...queuedTasks, newTask]);
  };

  const goalColors = ['#fef3c7', '#dbeafe', '#e0e7ff', '#fce7f3', '#d1fae5', '#fed7aa'];
  
  const handleAddGoal = (title: string) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: title,
      color: goalColors[goals.length % goalColors.length],
    };
    setGoals([...goals, newGoal]);
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
      
      if (e.key === 'M' && e.shiftKey && !isInputFocused) {
        e.preventDefault();
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return;
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        if (activeElement?.tagName === 'TEXTAREA' || activeElement?.tagName === 'INPUT') {
          (activeElement as HTMLElement).blur();
        }
        setSelectedTask(null);
        setSelectedQueuedTaskId(null);
        setSelectedGoalInStack(null);
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
      
      else if (e.key === 'g' && !isInputFocused) {
        e.preventDefault();
        goalInputRef.current?.focus();
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
      
      else if (e.key === 'G' && !isInputFocused) {
        e.preventDefault();
        if (goals.length > 0) {
          const firstGoal = goals[0];
          setSelectedGoalInStack(firstGoal.id);
          setSelectedTask(null);
          setSelectedQueuedTaskId(null);
        }
      }
      
      else if (e.key === 'Enter' && !isInputFocused && selectedGoalInStack && !selectedTask) {
        e.preventDefault();
        const goal = goals.find(g => g.id === selectedGoalInStack);
        if (goal) {
          setCurrentGoal(goal);
          setGoals(goals.filter(g => g.id !== selectedGoalInStack));
          setSelectedGoalInStack(null);
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
        } else if (selectedGoalInStack) {
          const currentIndex = goals.findIndex(g => g.id === selectedGoalInStack);
          if (currentIndex < goals.length - 1) {
            const nextGoal = goals[currentIndex + 1];
            setSelectedGoalInStack(nextGoal.id);
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
        } else if (selectedGoalInStack) {
          const currentIndex = goals.findIndex(g => g.id === selectedGoalInStack);
          if (currentIndex > 0) {
            const prevGoal = goals[currentIndex - 1];
            setSelectedGoalInStack(prevGoal.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, completedTasks, queuedTasks, goals, currentGoal, selectedTask, selectedQueuedTaskId, selectedGoalInStack, handleDone, handlePlayPause]);

  return (
    <>
    <div className="flex justify-center items-center h-screen bg-background px-8">
      <div className="flex max-w-[1000px] w-full h-[90vh] border-4 rounded-lg relative bg-[#faf8f5] dark:bg-[#1a1a1a]" style={{ borderColor: '#e8e4dc' }}>
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="w-[28%] flex flex-col relative">
        <div className="h-1/2 p-4 pb-2 flex flex-col items-end border-b-2" style={{ borderColor: '#e8e4dc' }}>
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide text-muted-foreground text-right w-full">
            Completed Today
          </h2>
          <div className="flex-1 overflow-y-auto w-full relative">
            <GoalTaskConnections goals={goals} tasks={completedTasks} currentGoal={currentGoal} />
            <div style={{ zIndex: 1, position: 'relative' }}>
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
          </div>
        </div>

        <div className="h-1/2 p-4 pt-2 flex flex-col">
          <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
            Goals
          </h2>
          <div className="mb-3">
            <GoalInput
              ref={goalInputRef}
              onAddGoal={handleAddGoal}
              backgroundColor={colors.goalBackground}
              outlineColor={colors.outline}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            <GoalsList
              goals={goals}
              onGoalClick={(goal) => {
                const newSelectedId = goal.id === selectedGoalInStack ? null : goal.id;
                setSelectedGoalInStack(newSelectedId);
                if (newSelectedId) {
                  setSelectedTask(null);
                  setSelectedQueuedTaskId(null);
                }
              }}
              onPromote={(goal) => {
                setCurrentGoal(goal);
                setGoals(goals.filter(g => g.id !== goal.id));
                setSelectedGoalInStack(null);
              }}
              selectedGoalId={selectedGoalInStack}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-8">
        <div className="h-[35%] pb-4 flex flex-col items-end">
          <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide text-muted-foreground text-right w-full">
            Task Queue
          </h2>
          <div className="flex gap-4 h-[calc(100%-2rem)] max-w-[500px] ml-auto">
            <div className="w-[200px] flex-shrink-0">
              <QueueInput
                ref={queueInputRef}
                onAddTask={handleAddToQueue}
                backgroundColor="#dbeafe"
                outlineColor="#3b82f6"
              />
            </div>
            <div className="flex-1 max-w-[300px] overflow-y-auto pr-2">
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

        <div className="h-[65%] pt-4">
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-4 flex-1 max-w-[400px]">
              <CurrentGoal
                goal={currentGoal}
                onClear={() => {
                  if (currentGoal) {
                    setGoals([...goals, currentGoal]);
                    setCurrentGoal(null);
                  }
                }}
              />
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

              <TaskDetailsPanel
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                completedBgColor={colors.completedBackground}
                queuedBgColor="#dbeafe"
                outlineColor={colors.outline}
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
        </div>
      </div>
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
    </>
  );
}
