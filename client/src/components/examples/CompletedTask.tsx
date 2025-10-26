import CompletedTask from "../CompletedTask";

export default function CompletedTaskExample() {
  return (
    <div className="p-8 space-y-2 max-w-md">
      <CompletedTask
        title="Design homepage mockups"
        startTime="08:30"
        endTime="09:15"
        backgroundColor="#d1fae5"
        outlineColor="#d97706"
      />
      <CompletedTask
        title="Review pull requests"
        startTime="09:15"
        endTime="09:45"
        backgroundColor="#dbeafe"
        outlineColor="#d97706"
      />
      <CompletedTask
        title="Team standup meeting"
        startTime="10:00"
        endTime="10:30"
        backgroundColor="#fef3c7"
        outlineColor="#d97706"
      />
    </div>
  );
}
