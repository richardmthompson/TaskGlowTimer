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
import RewardStack from "@/components/RewardStack";
import BrandBadge from "@/components/BrandBadge";
import type { Goal } from "../types/goal";
import type { Reward, RewardSummary } from "../types/reward";

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
    | { type: 'completed'; title: string; startTime: string; endTime: string; goalId?: string | null }
    | { type: 'queued'; title: string; id: string; goalId?: string | null }
    | null
  >(null);
  const [selectedQueuedTaskId, setSelectedQueuedTaskId] = useState<string | null>(null);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);
  const [showStickyError, setShowStickyError] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [rewardStack, setRewardStack] = useState<Reward[]>([]);
  const [lastRewardAt, setLastRewardAt] = useState<number>(0);

  const [colors, setColors] = useState<ColorSettings>({
    stickyBackground: "#fef3c7",
    completedBackground: "#d1fae5",
    goalBackground: "#fed7aa",
    clockDefault: "#e5e7eb",
    clockElapsed: "#3b82f6",
    outline: "#d97706",
  });

  // Dark mode colors
  const [darkColors] = useState({
    stickyBackground: "#3f3f1a",
    completedBackground: "#1a3f2f",
    goalBackground: "#3f2f1a",
    clockDefault: "#374151",
    clockElapsed: "#60a5fa",
    outline: "#1f2937",
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stickyNoteRef = useRef<HTMLTextAreaElement>(null);
  const queueInputRef = useRef<HTMLTextAreaElement>(null);
  const goalInputRef = useRef<HTMLTextAreaElement>(null);

  // Track dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Medal/Diamond conversion logic
  const consolidateRewards = useCallback((rewards: Reward[]): Reward[] => {
    const newStack = [...rewards];
    
    // Check if top two items are medals (30 minutes each)
    while (newStack.length >= 2) {
      const top = newStack[0];
      const second = newStack[1];
      
      if (top.type === 'medal' && top.minutes === 30 && 
          second.type === 'medal' && second.minutes === 30) {
        // Combine two medals into a diamond
        const diamond: Reward = {
          id: Date.now().toString(),
          type: 'diamond',
          minutes: 60,
          createdAt: new Date(),
        };
        newStack.splice(0, 2, diamond);
      } else {
        break;
      }
    }
    
    return newStack;
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const newSeconds = prev + 1;
          
          // Check if we've completed a 30-minute cycle
          if (newSeconds > 0 && newSeconds % 1800 === 0 && newSeconds !== lastRewardAt) {
            // Award a medal
            const medal: Reward = {
              id: Date.now().toString(),
              type: 'medal',
              minutes: 30,
              createdAt: new Date(),
            };
            
            setLastRewardAt(newSeconds);
            setRewardStack((prev) => {
              const newStack = [medal, ...prev];
              return consolidateRewards(newStack);
            });
          }
          
          return newSeconds;
        });
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
  }, [isRunning, lastRewardAt, consolidateRewards]);

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
      
      // Calculate reward summary
      const rewardSummary: RewardSummary = {
        medals: rewardStack.filter(r => r.type === 'medal').length,
        diamonds: rewardStack.filter(r => r.type === 'diamond').length,
        totalMinutes: rewardStack.reduce((sum, r) => sum + r.minutes, 0),
      };
      
      const newTask: CompletedTaskData = {
        id: Date.now().toString(),
        title: currentTask,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        goalId: currentGoal?.id || null,
        rewards: rewardSummary.totalMinutes > 0 ? rewardSummary : undefined,
      };

      setCompletedTasks((prev) => [...prev, newTask]);
      setCurrentTask("");
      setElapsedSeconds(0);
      setIsRunning(false);
      setTaskStartTime(null);
      setRewardStack([]);
      setLastRewardAt(0);
    }
  }, [currentTask, taskStartTime, currentGoal, rewardStack]);

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
    <div className="flex justify-center items-center h-screen bg-background px-8">
      <div className="relative">
        <div className="absolute -top-16 left-0 z-20">
          <BrandBadge />
        </div>
        <div className="flex max-w-[1200px] w-full h-[90vh] border-4 rounded-lg relative bg-[#faf8f5] dark:bg-[#1a1a1a] border-[#e8e4dc] dark:border-[#2a2a2a]">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <ThemeToggle />
        </div>
        <GoalTaskConnections goals={goals} tasks={completedTasks} currentGoal={currentGoal} />
        
        <div className="w-[28%] flex flex-col relative" style={{ zIndex: 1 }}>
        <div className="h-1/2 p-4 pb-2 flex flex-col items-end border-b-2 border-[#e8e4dc] dark:border-[#2a2a2a]">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide text-muted-foreground text-right w-full">
            Completed Today
          </h2>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 overflow-y-auto pr-2">
              <CompletedTasksList
                tasks={completedTasks}
                backgroundColor={isDarkMode ? darkColors.completedBackground : colors.completedBackground}
                outlineColor={isDarkMode ? darkColors.outline : colors.outline}
                goals={goals}
                currentGoal={currentGoal}
                onTaskClick={(task) => {
                  setSelectedTask({ ...task, type: 'completed' });
                  setSelectedQueuedTaskId(null);
                  // Bidirectional selection: select the task's goal too
                  if (task.goalId) {
                    if (currentGoal?.id === task.goalId) {
                      // Goal is current goal, don't select in stack
                      setSelectedGoalInStack(null);
                    } else {
                      const goalInStack = goals.find(g => g.id === task.goalId);
                      if (goalInStack) {
                        setSelectedGoalInStack(goalInStack.id);
                      }
                    }
                  }
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
              backgroundColor={isDarkMode ? darkColors.goalBackground : colors.goalBackground}
              outlineColor={isDarkMode ? darkColors.outline : colors.outline}
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
                backgroundColor={isDarkMode ? "#1a3f4f" : "#dbeafe"}
                outlineColor={isDarkMode ? "#2a4f5f" : "#3b82f6"}
              />
            </div>
            <div className="flex-1 max-w-[300px] overflow-y-auto pr-2">
              <QueuedTasksList
                tasks={queuedTasks}
                onReorder={setQueuedTasks}
                backgroundColor={isDarkMode ? "#1a3f4f" : "#dbeafe"}
                outlineColor={isDarkMode ? "#2a4f5f" : "#3b82f6"}
                selectedTaskId={selectedQueuedTaskId}
                onTaskClick={handleQueuedTaskClick}
                onQuickStart={handleQuickStart}
              />
            </div>
          </div>
        </div>

        <div className="h-[65%] pt-4 flex flex-col">
          <div className="flex items-start gap-8">
            <div className="flex flex-col gap-2 flex-1 max-w-[400px]">
              <CurrentGoal
                goal={currentGoal}
                onClear={() => {
                  if (currentGoal) {
                    setGoals([...goals, currentGoal]);
                    setCurrentGoal(null);
                  }
                }}
              />
              <div className="mb-2">
                <StatusIndicator isRunning={isRunning} currentTask={currentTask} />
              </div>
              <StickyNote
                ref={stickyNoteRef}
                value={currentTask}
                onChange={setCurrentTask}
                isActive={isRunning}
                backgroundColor={isDarkMode ? darkColors.stickyBackground : colors.stickyBackground}
                outlineColor={isDarkMode ? darkColors.outline : colors.outline}
                onEnterKey={handlePlayPause}
                showError={showStickyError}
              />
            </div>

            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center gap-4">
                <CircularTimer
                  elapsedSeconds={elapsedSeconds}
                  totalSeconds={1800}
                  defaultColor={isDarkMode ? darkColors.clockDefault : colors.clockDefault}
                  elapsedColor={isDarkMode ? darkColors.clockElapsed : colors.clockElapsed}
                  outlineColor={isDarkMode ? darkColors.outline : colors.outline}
                />
                <TimerControls
                  isRunning={isRunning}
                  onPlayPause={handlePlayPause}
                  onDone={handleDone}
                />
              </div>
              <RewardStack rewards={rewardStack} />
            </div>
          </div>

          {selectedTask && (() => {
            let goalInfo: { title?: string; color?: string } = { title: undefined, color: undefined };
            if (selectedTask.goalId) {
              const goal = currentGoal?.id === selectedTask.goalId ? currentGoal : goals.find(g => g.id === selectedTask.goalId);
              if (goal) {
                goalInfo = { title: goal.title, color: goal.color };
              }
            }
            return (
              <TaskDetailsPanel
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                completedBgColor={isDarkMode ? darkColors.completedBackground : colors.completedBackground}
                queuedBgColor={isDarkMode ? "#1a3f4f" : "#dbeafe"}
                outlineColor={isDarkMode ? darkColors.outline : colors.outline}
                goalTitle={goalInfo.title}
                goalColor={goalInfo.color}
              />
            );
          })()}
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
    </div>
  );
}
