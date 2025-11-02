interface CompletedTaskProps {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  backgroundColor?: string;
  outlineColor?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export default function CompletedTask({
  id,
  title,
  startTime,
  endTime,
  backgroundColor = "#d1fae5",
  outlineColor = "#d97706",
  onClick,
  isSelected = false,
}: CompletedTaskProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left relative pl-16 pr-4 py-3 rounded-lg border-2 hover-elevate active-elevate-2 transition-all duration-200 ${
        isSelected ? 'ring-2 ring-green-400 shadow-lg' : ''
      }`}
      style={{
        backgroundColor,
        borderColor: outlineColor,
      }}
      data-testid={`card-task-${id}`}
    >
      <div className="absolute left-2 top-2 text-xs font-mono text-gray-800 dark:text-gray-300">
        {startTime}
      </div>
      
      <div className="absolute left-2 bottom-2 text-xs font-mono text-gray-800 dark:text-gray-300">
        {endTime}
      </div>

      <div 
        className="absolute left-14 top-0 bottom-0 w-0.5" 
        style={{ backgroundColor: outlineColor }}
      />

      <div className="text-sm font-bold truncate text-gray-800 dark:text-gray-300">
        {title}
      </div>
    </button>
  );
}
