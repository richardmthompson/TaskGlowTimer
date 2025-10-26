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
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      setGlowColor(`rgba(${r}, ${g}, ${b}, 0.6)`);
    } else {
      setGlowColor("");
    }
  }, [isActive, outlineColor]);

  return (
    <div className="relative">
      <style>{`
        @keyframes glow-diffuse {
          0%, 100% {
            box-shadow: 0 0 20px ${glowColor}, 0 0 40px ${glowColor}10;
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 40px ${glowColor}, 0 0 80px ${glowColor}30, 0 0 120px ${glowColor}10;
            transform: scale(1.01);
          }
        }
      `}</style>
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
          animation: isActive ? "glow-diffuse 3s ease-in-out infinite" : "none",
        }}
      />
    </div>
  );
}
