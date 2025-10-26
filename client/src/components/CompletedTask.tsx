interface CompletedTaskProps {
  title: string;
  startTime: string;
  endTime: string;
  backgroundColor?: string;
  outlineColor?: string;
  onClick?: () => void;
}

export default function CompletedTask({
  title,
  startTime,
  endTime,
  backgroundColor = "#d1fae5",
  outlineColor = "#d97706",
  onClick,
}: CompletedTaskProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left relative pl-16 pr-4 py-3 rounded-lg border-2 hover-elevate active-elevate-2 transition-transform duration-200" 
      style={{
        backgroundColor,
        borderColor: outlineColor,
      }}
      data-testid={`card-task-${title}`}
    >
      <div className="absolute left-2 top-2 text-xs font-mono" style={{ color: "#1f2937" }}>
        {startTime}
      </div>
      
      <div className="absolute left-2 bottom-2 text-xs font-mono" style={{ color: "#1f2937" }}>
        {endTime}
      </div>

      <div 
        className="absolute left-14 top-0 bottom-0 w-0.5" 
        style={{ backgroundColor: outlineColor }}
      />

      <div className="text-sm font-medium truncate" style={{ color: "#1f2937" }}>
        {title}
      </div>
    </button>
  );
}
