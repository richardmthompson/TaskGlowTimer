import { useState, useEffect } from "react";

interface StickyNoteProps {
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
  backgroundColor?: string;
  outlineColor?: string;
}

export default function StickyNote({
  value,
  onChange,
  isActive,
  backgroundColor = "#fef3c7",
  outlineColor = "#d97706",
}: StickyNoteProps) {
  const [glowColor, setGlowColor] = useState("");

  useEffect(() => {
    if (isActive && outlineColor) {
      const hex = outlineColor.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      setGlowColor(`rgba(${r}, ${g}, ${b}, 0.6)`);
    }
  }, [isActive, outlineColor]);

  return (
    <div className="relative">
      <textarea
        data-testid="input-current-task"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What are you working on?"
        className="w-full min-h-32 h-32 p-6 text-lg font-medium rounded-xl border-2 resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
        style={{
          backgroundColor,
          borderColor: outlineColor,
          color: "#1f2937",
          boxShadow: isActive ? `0 0 30px ${glowColor}` : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          animation: isActive ? "glow-pulse 2s ease-in-out infinite" : "none",
          ["--glow-color" as string]: glowColor,
        }}
      />
    </div>
  );
}
