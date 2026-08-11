import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Goal, Session, StoredReward, Task } from "@shared/schema";

// Dates cross the wire as ISO strings.
type DateToString<V> = V extends Date ? string : V;
type Serialized<T> = { [K in keyof T]: DateToString<T[K]> };

export type WireGoal = Serialized<Goal>;
export type WireTask = Serialized<Task>;
export type WireSession = Serialized<Session>;

export interface ServerState {
  session: WireSession;
  goals: WireGoal[];
  tasks: WireTask[];
}

// Request bodies: timestamps as epoch ms (coerced to Dates server-side).
export interface GoalBody {
  id: string;
  title: string;
  color: string;
}

export interface TaskBody {
  id: string;
  title: string;
  status: "queued" | "completed";
  sortOrder?: number;
  goalId?: string | null;
  startedAt?: number | null;
  completedAt?: number | null;
  medals?: number;
  diamonds?: number;
  rewardMinutes?: number;
}

export interface SessionPatchBody {
  currentTaskTitle?: string;
  isRunning?: boolean;
  elapsedSeconds?: number;
  runningSince?: number | null;
  taskStartedAt?: number | null;
  lastRewardAt?: number;
  rewardStack?: StoredReward[];
}

function localMidnightMs(): number {
  return new Date().setHours(0, 0, 0, 0);
}

export function usePersistence() {
  const { toast } = useToast();
  const offlineRef = useRef(false);
  const [offline, setOffline] = useState(false);
  const sinceRef = useRef(localMidnightMs());

  const goOffline = useCallback(() => {
    if (!offlineRef.current) {
      offlineRef.current = true;
      setOffline(true);
      toast({
        variant: "destructive",
        title: "Offline mode",
        description: "Server unreachable, changes won't be saved",
      });
    }
  }, [toast]);

  const goOnline = useCallback(() => {
    if (offlineRef.current) {
      offlineRef.current = false;
      setOffline(false);
      toast({
        title: "Reconnected",
        description: "Changes are being saved again",
      });
    }
  }, [toast]);

  const stateQuery = useQuery<ServerState>({
    queryKey: ["state"],
    queryFn: async () => {
      const res = await fetch(`/api/state?since=${sinceRef.current}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return res.json();
    },
    retry: 1,
    staleTime: Infinity,
  });

  const { isError: hydrationFailed } = stateQuery;
  useEffect(() => {
    if (hydrationFailed) {
      goOffline();
    }
  }, [hydrationFailed, goOffline]);

  // F4: only a network failure (fetch rejects with TypeError before any
  // response arrives) means the server is unreachable. HTTP-status errors
  // (4xx/5xx) prove the server responded and must not flip the offline flag.
  const handleMutationError = useCallback(
    (error: unknown) => {
      if (error instanceof TypeError) {
        goOffline();
      } else {
        console.error("Persistence write failed:", error);
      }
    },
    [goOffline],
  );

  const createGoalMutation = useMutation({
    mutationFn: (body: GoalBody) => apiRequest("POST", "/api/goals", body),
    onSuccess: goOnline,
    onError: handleMutationError,
  });

  const setCurrentGoalMutation = useMutation({
    mutationFn: (goalId: string | null) =>
      apiRequest("PUT", "/api/goals/current", { goalId }),
    onSuccess: goOnline,
    onError: handleMutationError,
  });

  const createTaskMutation = useMutation({
    mutationFn: (body: TaskBody) => apiRequest("POST", "/api/tasks", body),
    onSuccess: goOnline,
    onError: handleMutationError,
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/tasks/${encodeURIComponent(id)}`),
    onSuccess: goOnline,
    onError: handleMutationError,
  });

  const reorderQueueMutation = useMutation({
    mutationFn: (ids: string[]) =>
      apiRequest("PUT", "/api/queue/order", { ids }),
    onSuccess: goOnline,
    onError: handleMutationError,
  });

  const patchSessionMutation = useMutation({
    mutationFn: (patch: SessionPatchBody) =>
      apiRequest("PATCH", "/api/session", patch),
    onSuccess: goOnline,
    onError: handleMutationError,
  });

  // Pending debounced title save (see saveTitle below).
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { mutate: mutateCreateGoal } = createGoalMutation;
  const { mutate: mutateSetCurrentGoal } = setCurrentGoalMutation;
  const { mutate: mutateCreateTask } = createTaskMutation;
  const { mutate: mutateDeleteTask } = deleteTaskMutation;
  const { mutate: mutateReorderQueue } = reorderQueueMutation;
  const { mutate: mutatePatchSession } = patchSessionMutation;

  const createGoal = useCallback(
    (body: GoalBody) => mutateCreateGoal(body),
    [mutateCreateGoal],
  );
  const setCurrentGoal = useCallback(
    (goalId: string | null) => mutateSetCurrentGoal(goalId),
    [mutateSetCurrentGoal],
  );
  const createTask = useCallback(
    (body: TaskBody) => mutateCreateTask(body),
    [mutateCreateTask],
  );
  const deleteTask = useCallback(
    (id: string) => mutateDeleteTask(id),
    [mutateDeleteTask],
  );
  const reorderQueue = useCallback(
    (ids: string[]) => mutateReorderQueue(ids),
    [mutateReorderQueue],
  );
  const patchSession = useCallback(
    (patch: SessionPatchBody) => {
      // F1: a direct patch that sets the title supersedes any pending debounced
      // title save; cancel it so a stale title can't fire after this PATCH and
      // resurrect (post-Done) or wipe (post-quick-start) the server-side title.
      if ("currentTaskTitle" in patch && titleTimerRef.current) {
        clearTimeout(titleTimerRef.current);
        titleTimerRef.current = null;
      }
      mutatePatchSession(patch);
    },
    [mutatePatchSession],
  );

  // Debounced sticky-note title save (~600ms).
  const saveTitle = useCallback(
    (title: string) => {
      if (titleTimerRef.current) {
        clearTimeout(titleTimerRef.current);
      }
      titleTimerRef.current = setTimeout(() => {
        titleTimerRef.current = null;
        mutatePatchSession({ currentTaskTitle: title });
      }, 600);
    },
    [mutatePatchSession],
  );

  useEffect(() => {
    return () => {
      if (titleTimerRef.current) {
        clearTimeout(titleTimerRef.current);
      }
    };
  }, []);

  return {
    // Hydration finished (successfully or not); safe to seed local state.
    ready: stateQuery.isSuccess || stateQuery.isError,
    state: stateQuery.data,
    offline,
    createGoal,
    setCurrentGoal,
    createTask,
    deleteTask,
    reorderQueue,
    patchSession,
    saveTitle,
  };
}
