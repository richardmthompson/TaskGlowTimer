import CompletedTasksList, { CompletedTaskData } from "../CompletedTasksList";

const mockTasks: CompletedTaskData[] = [
  { id: "1", title: "Design homepage mockups", startTime: "08:30", endTime: "09:15" },
  { id: "2", title: "Review pull requests", startTime: "09:15", endTime: "09:45" },
  { id: "3", title: "Team standup meeting", startTime: "10:00", endTime: "10:30" },
  { id: "4", title: "Update documentation", startTime: "10:30", endTime: "11:00" },
];

export default function CompletedTasksListExample() {
  return (
    <div className="p-8 max-w-md">
      <h2 className="text-lg font-semibold mb-4">Today's Completed Tasks</h2>
      <CompletedTasksList
        tasks={mockTasks}
        backgroundColor="#d1fae5"
        outlineColor="#d97706"
      />
    </div>
  );
}
