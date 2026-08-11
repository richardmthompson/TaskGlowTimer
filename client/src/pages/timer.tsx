import { useState, useEffect, useRef, useCallback } from "react";
import StickyNote from "@/components/StickyNote";
import CircularTimer from "@/components/CircularTimer";
import TimerControls from "@/components/TimerControls";
import CompletedTasksList, { CompletedTaskData } from "@/components/CompletedTasksList";
import HelpPanel from "@/components/HelpPanel";
import TaskDetailsPanel from "@/components/TaskDetailsPanel";
import QueueInput from "@/components/QueueInput";
import QueuedTasksList, { QueuedTaskData } from "@/components/QueuedTasksList";
import GoalInput from "@/components/GoalInput";
import GoalsList from "@/components/GoalsList";
import GoalTaskConnections from "@/components/GoalTaskConnections";
import { ThemeToggle } from "@/components/ThemeToggle";
import RewardStack from "@/components/RewardStack";
import BrandBadge from "@/components/BrandBadge";
import { Kbd } from "@/components/ui/Kbd";
import { toggleTheme } from "@/lib/theme";
import { usePersistence } from "@/hooks/use-persistence";
import type { StoredReward } from "@shared/schema";
import type { Goal } from "../types/goal";
import type { Reward, RewardSummary } from "../types/reward";

// All color now comes from arlabs design tokens (CSS vars + Tailwind), not
// runtime state. Goals still carry a `color` field on the wire (server-persisted
// GoalBody contract); it is a token sentinel so the persistence layer stays intact
// while goal surfaces render via token classes, not this value.
const GOAL_TOKEN_COLOR = "hsl(var(--primary))";

function toStoredRewards(rewards: Reward[]): StoredReward[] {
  return rewards.map((r) => ({
    id: r.id,
    type: r.type,
    minutes: r.minutes,
    createdAt: r.createdAt.getTime(),
  }));
}

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
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);
  const [showStickyError, setShowStickyError] = useState(false);
  const [rewardStack, setRewardStack] = useState<Reward[]>([]);
  const [lastRewardAt, setLastRewardAt] = useState<number>(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stickyNoteRef = useRef<HTMLTextAreaElement>(null);
  const queueInputRef = useRef<HTMLTextAreaElement>(null);
  const goalInputRef = useRef<HTMLTextAreaElement>(null);

  const persistence = usePersistence();
  const hydratedRef = useRef(false);
  const lastSavedTitleRef = useRef<string | null>(null);
  // F2: next server sort_order for queue adds. Deletes leave gaps (fine,
  // relative order is preserved); reorder re-indexes to 0..n-1 so it resets to n.
  const nextSortOrderRef = useRef(0);

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

  // One-shot hydration from the server (write-through persistence layer).
  useEffect(() => {
    if (hydratedRef.current || !persistence.ready) return;
    hydratedRef.current = true;

    const state = persistence.state;
    if (!state) {
      // Hydration failed (offline mode): keep empty defaults, full functionality.
      lastSavedTitleRef.current = "";
      return;
    }

    const stackGoals: Goal[] = [];
    let promotedGoal: Goal | null = null;
    for (const g of state.goals) {
      const goal: Goal = { id: g.id, title: g.title, color: g.color };
      if (g.isCurrent) {
        promotedGoal = goal;
      } else {
        stackGoals.push(goal);
      }
    }
    setGoals(stackGoals);
    setCurrentGoal(promotedGoal);

    const queuedWire = state.tasks.filter((t) => t.status === "queued");
    nextSortOrderRef.current = queuedWire.reduce(
      (max, t) => Math.max(max, t.sortOrder + 1),
      0,
    );
    setQueuedTasks(
      queuedWire.map((t) => ({ id: t.id, title: t.title, goalId: t.goalId })),
    );
    setCompletedTasks(
      state.tasks
        .filter((t) => t.status === "completed")
        .map((t) => {
          const completedAt = t.completedAt ? new Date(t.completedAt) : new Date();
          const startedAt = t.startedAt ? new Date(t.startedAt) : completedAt;
          return {
            id: t.id,
            title: t.title,
            startTime: formatTime(startedAt),
            endTime: formatTime(completedAt),
            goalId: t.goalId,
            rewards:
              t.rewardMinutes > 0
                ? {
                    medals: t.medals,
                    diamonds: t.diamonds,
                    totalMinutes: t.rewardMinutes,
                  }
                : undefined,
          };
        }),
    );

    const s = state.session;
    setCurrentTask(s.currentTaskTitle);
    lastSavedTitleRef.current = s.currentTaskTitle;
    setTaskStartTime(s.taskStartedAt ? new Date(s.taskStartedAt) : null);

    let elapsed = s.elapsedSeconds;
    if (s.isRunning && s.runningSince) {
      elapsed += Math.max(
        0,
        Math.floor((Date.now() - new Date(s.runningSince).getTime()) / 1000),
      );
    }
    let lastReward = s.lastRewardAt;
    let stack: Reward[] = s.rewardStack.map((r) => ({
      id: r.id,
      type: r.type,
      minutes: r.minutes,
      createdAt: new Date(r.createdAt),
    }));
    // Award medals owed for 30-min boundaries crossed while the page was unloaded.
    while (lastReward + 1800 <= elapsed) {
      lastReward += 1800;
      const medal: Reward = {
        id: `${Date.now()}-${lastReward}`,
        type: 'medal',
        minutes: 30,
        createdAt: new Date(),
      };
      stack = consolidateRewards([medal, ...stack]);
    }
    setElapsedSeconds(elapsed);
    setLastRewardAt(lastReward);
    setRewardStack(stack);
    setIsRunning(s.isRunning);
  }, [persistence.ready, persistence.state, consolidateRewards]);

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
    const now = new Date();
    if (!isRunning && !taskStartTime) {
      setTaskStartTime(now);
    }
    if (!isRunning) {
      persistence.patchSession({
        isRunning: true,
        runningSince: now.getTime(),
        taskStartedAt: (taskStartTime ?? now).getTime(),
        elapsedSeconds,
        lastRewardAt,
        rewardStack: toStoredRewards(rewardStack),
      });
    } else {
      persistence.patchSession({
        isRunning: false,
        runningSince: null,
        elapsedSeconds,
        lastRewardAt,
        rewardStack: toStoredRewards(rewardStack),
      });
    }
    setIsRunning(!isRunning);
  }, [isRunning, taskStartTime, elapsedSeconds, lastRewardAt, rewardStack, persistence.patchSession]);

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

      persistence.createTask({
        id: newTask.id,
        title: newTask.title,
        status: "completed",
        goalId: newTask.goalId,
        startedAt: startTime.getTime(),
        completedAt: endTime.getTime(),
        medals: rewardSummary.medals,
        diamonds: rewardSummary.diamonds,
        rewardMinutes: rewardSummary.totalMinutes,
      });
      persistence.patchSession({
        currentTaskTitle: "",
        isRunning: false,
        elapsedSeconds: 0,
        runningSince: null,
        taskStartedAt: null,
        lastRewardAt: 0,
        rewardStack: [],
      });
      lastSavedTitleRef.current = "";

      setCompletedTasks((prev) => [...prev, newTask]);
      setCurrentTask("");
      setElapsedSeconds(0);
      setIsRunning(false);
      setTaskStartTime(null);
      setRewardStack([]);
      setLastRewardAt(0);
    }
  }, [currentTask, taskStartTime, currentGoal, rewardStack, persistence.createTask, persistence.patchSession]);

  const handleAddToQueue = (taskTitle: string) => {
    const newTask: QueuedTaskData = {
      id: Date.now().toString(),
      title: taskTitle,
      goalId: currentGoal?.id || null,
    };
    persistence.createTask({
      id: newTask.id,
      title: newTask.title,
      status: "queued",
      sortOrder: nextSortOrderRef.current,
      goalId: newTask.goalId,
    });
    nextSortOrderRef.current += 1;
    setQueuedTasks([...queuedTasks, newTask]);
  };

  const handleAddGoal = (title: string) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: title,
      color: GOAL_TOKEN_COLOR,
    };
    persistence.createGoal(newGoal);
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
      persistence.deleteTask(taskId);
      persistence.patchSession({ currentTaskTitle: task.title });
      lastSavedTitleRef.current = task.title;
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
        toggleTheme();
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
          const deletedTask = completedTasks.find(t => t.title === selectedTask.title && t.startTime === selectedTask.startTime);
          if (deletedTask) {
            persistence.deleteTask(deletedTask.id);
          }
          setCompletedTasks(prev => prev.filter(t => !(t.title === selectedTask.title && t.startTime === selectedTask.startTime)));
          setSelectedTask(null);
        } else if (selectedTask.type === 'queued' && selectedQueuedTaskId) {
          persistence.deleteTask(selectedQueuedTaskId);
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
        const restoredTask = completedTasks.find(t => t.title === selectedTask.title && t.startTime === selectedTask.startTime);
        if (restoredTask) {
          persistence.deleteTask(restoredTask.id);
        }
        persistence.patchSession({ currentTaskTitle: selectedTask.title });
        lastSavedTitleRef.current = selectedTask.title;
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
          persistence.setCurrentGoal(goal.id);
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
  }, [isRunning, completedTasks, queuedTasks, goals, currentGoal, selectedTask, selectedQueuedTaskId, selectedGoalInStack, handleDone, handlePlayPause, persistence.deleteTask, persistence.patchSession, persistence.setCurrentGoal]);

  // Debounced sticky-note title persistence (suppressed until hydrated).
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (lastSavedTitleRef.current === currentTask) return;
    lastSavedTitleRef.current = currentTask;
    persistence.saveTitle(currentTask);
  }, [currentTask, persistence.saveTitle]);

  return (
    <div className="flex justify-center items-center min-h-screen px-8 py-6">
      <div className="flex flex-col w-full max-w-[1200px] h-[calc(100vh-3rem)] min-h-[560px] rounded-card overflow-hidden border-frame border-border bg-card">
        {/* Meta strip: tiny mono furniture, reference-header style. The wordmark
            lives in the canvas masthead, not here. */}
        <header className="flex items-center justify-between gap-4 shrink-0 border-b-thin border-border px-5 py-2 font-mono text-[10px] uppercase tracking-label text-muted-foreground">
          <span>VoxPlan · Focus Instrument</span>
          <span className="flex items-center gap-3">
            <span className="hidden sm:inline">
              <Kbd>Shift</Kbd>
              {' '}
              <Kbd>M</Kbd>
              {' '}theme
            </span>
            <ThemeToggle />
          </span>
        </header>

        <div className="relative flex flex-1 min-h-0">
          <GoalTaskConnections goals={goals} tasks={completedTasks} currentGoal={currentGoal} />

          <div className="w-[28%] min-w-[220px] flex flex-col min-h-0 border-r-thin border-border relative" style={{ zIndex: 1 }}>
            <div className="flex-1 min-h-0 p-4 pb-2 flex flex-col border-b-thin border-border">
              <h2 className="text-sm font-mono font-bold mb-3 uppercase tracking-label text-muted-foreground">
                Completed Today
              </h2>
              <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                <CompletedTasksList
                  tasks={completedTasks}
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

            <div className="flex-1 min-h-0 p-4 pt-2 flex flex-col">
              <h2 className="text-sm font-mono font-bold mb-3 uppercase tracking-label text-muted-foreground">
                Goals
              </h2>
              <div className="mb-3">
                <GoalInput
                  ref={goalInputRef}
                  onAddGoal={handleAddGoal}
                />
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
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
                    persistence.setCurrentGoal(goal.id);
                    setCurrentGoal(goal);
                    setGoals(goals.filter(g => g.id !== goal.id));
                    setSelectedGoalInStack(null);
                  }}
                  selectedGoalId={selectedGoalInStack}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col overflow-y-auto px-8 pt-6 pb-4 relative" style={{ zIndex: 1 }}>
            <div className="w-full max-w-[620px] mx-auto flex flex-col flex-1">
              <BrandBadge />

              {/* Instrument panel: ink surface in both themes, the single violet
                  emphasis shadow, head strip + truth strip + body + cascade. */}
              <div className="panel-ink rounded-hub border-thin border-border shadow-neo-accent overflow-hidden mt-6">
                {/* Head strip */}
                <div className="flex items-baseline justify-between gap-4 px-4 py-3 border-b panel-hairline-soft">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-kicker panel-muted">
                    The Instrument Panel
                  </span>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-kicker text-primary">
                    {isRunning ? 'Running' : currentTask ? 'Paused' : 'Idle'}
                  </span>
                </div>

                {/* Truth strip */}
                <div className="grid grid-cols-3 border-b panel-hairline-soft">
                  <div className="px-4 py-3 border-r panel-hairline-soft">
                    <span className="block font-display font-black text-xl text-primary leading-tight" data-testid="stat-completed">
                      {completedTasks.length}
                    </span>
                    <span className="block mt-0.5 font-mono text-[8px] uppercase tracking-label panel-muted">
                      Completed today
                    </span>
                  </div>
                  <div className="px-4 py-3 border-r panel-hairline-soft">
                    <span className="block font-display font-black text-xl text-primary leading-tight" data-testid="stat-queued">
                      {queuedTasks.length}
                    </span>
                    <span className="block mt-0.5 font-mono text-[8px] uppercase tracking-label panel-muted">
                      In queue
                    </span>
                  </div>
                  <div className="px-4 py-3 min-w-0">
                    {currentGoal ? (
                      <span className="flex items-baseline gap-2 min-w-0">
                        <span className="block font-display font-black text-xl text-primary leading-tight truncate min-w-0" title={currentGoal.title} data-testid={`current-goal-${currentGoal.id}`}>
                          {currentGoal.title}
                        </span>
                        <button
                          onClick={() => {
                            persistence.setCurrentGoal(null);
                            setGoals([...goals, currentGoal]);
                            setCurrentGoal(null);
                          }}
                          aria-label="Clear current goal"
                          data-testid="button-clear-goal"
                          className="font-mono text-[10px] panel-muted hover:text-primary flex-shrink-0 min-h-6 min-w-6"
                        >
                          ✕
                        </button>
                      </span>
                    ) : (
                      <span className="block font-display font-black text-xl uppercase leading-tight panel-muted">
                        None
                      </span>
                    )}
                    <span className="block mt-0.5 font-mono text-[8px] uppercase tracking-label panel-muted">
                      Current goal
                    </span>
                  </div>
                </div>

                {/* Body: sticky + dial */}
                <div className="flex flex-wrap items-center gap-6 px-4 py-5">
                  <div className="flex flex-col flex-1 min-w-[200px]">
                    <StickyNote
                      ref={stickyNoteRef}
                      value={currentTask}
                      onChange={setCurrentTask}
                      isActive={isRunning}
                      onEnterKey={handlePlayPause}
                      showError={showStickyError}
                    />
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="flex flex-col items-center gap-4">
                      <CircularTimer
                        elapsedSeconds={elapsedSeconds}
                        totalSeconds={1800}
                        isRunning={isRunning}
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

                {/* Cascade line */}
                <div className="px-4 pb-3 font-mono text-[9px] font-bold tracking-label panel-muted">
                  THE LINE: <span className="text-primary">goal → queue → sticky → clock → banked</span>
                </div>
              </div>

              {selectedTask && (() => {
                let goalTitle: string | undefined;
                if (selectedTask.goalId) {
                  const goal = currentGoal?.id === selectedTask.goalId ? currentGoal : goals.find(g => g.id === selectedTask.goalId);
                  if (goal) {
                    goalTitle = goal.title;
                  }
                }
                return (
                  <TaskDetailsPanel
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    goalTitle={goalTitle}
                  />
                );
              })()}

              {/* Corner furniture: title-block stamp, engineer's-drawing style. */}
              <div className="mt-auto pt-5 flex justify-end">
                <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 rounded-code border-thin border-border bg-card px-3 py-2 font-mono text-[9px] tracking-label">
                  <span className="text-muted-foreground uppercase">Unit</span>
                  <span className="font-bold uppercase">Web-Mini</span>
                  <span className="text-muted-foreground uppercase">Mode</span>
                  <span className="font-bold uppercase">{isRunning ? 'Focus' : 'Standby'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[300px] min-w-[240px] flex flex-col min-h-0 border-l-thin border-border p-4 relative" style={{ zIndex: 1 }}>
            <h2 className="text-sm font-mono font-bold mb-3 uppercase tracking-label text-muted-foreground">
              Task Queue
            </h2>
            <div className="mb-3">
              <QueueInput
                ref={queueInputRef}
                onAddTask={handleAddToQueue}
              />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              <QueuedTasksList
                tasks={queuedTasks}
                onReorder={(tasks) => {
                  persistence.reorderQueue(tasks.map(t => t.id));
                  nextSortOrderRef.current = tasks.length;
                  setQueuedTasks(tasks);
                }}
                selectedTaskId={selectedQueuedTaskId}
                onTaskClick={handleQueuedTaskClick}
                onQuickStart={handleQuickStart}
              />
            </div>
          </div>
        </div>
      </div>

      <HelpPanel
        isExpanded={isHelpExpanded}
        onToggle={() => setIsHelpExpanded(!isHelpExpanded)}
      />
    </div>
  );
}
