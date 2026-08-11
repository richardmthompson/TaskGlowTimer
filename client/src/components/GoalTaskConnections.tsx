import { useEffect, useState, useRef } from "react";
import type { Goal } from "../types/goal";
import type { CompletedTaskData } from "./CompletedTasksList";

interface Connection {
  goalId: string;
  taskId: string;
}

interface GoalTaskConnectionsProps {
  goals: Goal[];
  tasks: CompletedTaskData[];
  currentGoal: Goal | null;
}

export default function GoalTaskConnections({ goals, tasks, currentGoal }: GoalTaskConnectionsProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Build connection list
    const newConnections: Connection[] = [];
    tasks.forEach((task) => {
      if (task.goalId) {
        // Check if the goal is the current goal or in the goals stack
        const goal = currentGoal?.id === task.goalId ? currentGoal : goals.find((g) => g.id === task.goalId);
        if (goal) {
          newConnections.push({
            goalId: goal.id,
            taskId: task.id,
          });
        }
      }
    });
    setConnections(newConnections);
  }, [goals, tasks, currentGoal]);

  const getPaths = () => {
    if (!svgRef.current) return [];

    const paths: Array<{ d: string }> = [];

    connections.forEach((conn) => {
      // Check if this is the current goal (displayed above sticky) or a goal in the stack
      let goalEl = document.querySelector(`[data-testid="current-goal-${conn.goalId}"]`);
      if (!goalEl) {
        goalEl = document.querySelector(`[data-testid="card-goal-${conn.goalId}"]`);
      }
      const taskEl = document.querySelector(`[data-testid="card-task-${conn.taskId}"]`);
      
      if (goalEl && taskEl) {
        const goalRect = goalEl.getBoundingClientRect();
        const taskRect = taskEl.getBoundingClientRect();
        const svgRect = svgRef.current!.getBoundingClientRect();

        // Start from right edge of goal card
        const startX = goalRect.right - svgRect.left;
        const startY = goalRect.top + goalRect.height / 2 - svgRect.top;

        // End at left edge of task card
        const endX = taskRect.left - svgRect.left;
        const endY = taskRect.top + taskRect.height / 2 - svgRect.top;

        // Create curved path using bezier curve
        const midX = (startX + endX) / 2;
        const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

        paths.push({ d: path });
      }
    });

    return paths;
  };

  const [paths, setPaths] = useState<Array<{ d: string }>>([]);

  useEffect(() => {
    const updatePaths = () => {
      setPaths(getPaths());
    };

    // Initial render
    setTimeout(updatePaths, 100);

    // Update on resize
    window.addEventListener('resize', updatePaths);
    
    // Update periodically to catch DOM changes
    const interval = setInterval(updatePaths, 500);

    return () => {
      window.removeEventListener('resize', updatePaths);
      clearInterval(interval);
    };
  }, [connections]);

  if (connections.length === 0) return null;

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {paths.map((path, index) => (
        <path
          key={index}
          d={path.d}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeOpacity="0.6"
        />
      ))}
    </svg>
  );
}
