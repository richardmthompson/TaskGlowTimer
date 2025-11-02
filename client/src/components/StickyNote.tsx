import { useState, useEffect, forwardRef } from "react";

interface StickyNoteProps {
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
  backgroundColor?: string;
  outlineColor?: string;
  onEnterKey?: () => void;
  showError?: boolean;
}

const StickyNote = forwardRef<HTMLTextAreaElement, StickyNoteProps>(
  function StickyNote(
    {
      value,
      onChange,
      isActive,
      backgroundColor = "#fef3c7",
      outlineColor = "#d97706",
      onEnterKey,
      showError = false,
    },
    ref
  ) {
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onEnterKey?.();
      }
    };

    return (
      <div className="relative">
        {isActive && glowColor && (
          <style>{`
          @keyframes glow-diffuse {
            0%, 100% {
              box-shadow: none;
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 40px ${glowColor}, 0 0 80px ${glowColor}, 0 0 120px ${glowColor};
              transform: scale(1.01);
            }
          }
        `}</style>
        )}
        {showError && (
          <style>{`
          @keyframes shake-error {
            0%, 100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-10px);
            }
            75% {
              transform: translateX(10px);
            }
          }
        `}</style>
        )}
        <textarea
          ref={ref}
          data-testid="input-current-task"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What are you working on?"
          className="w-full min-h-32 h-32 p-6 text-lg font-bold rounded-xl border-2 resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-gray-800 dark:text-gray-300"
          style={{
            backgroundColor: showError ? "#fee2e2" : backgroundColor,
            borderColor: showError ? "#ef4444" : outlineColor,
            animation: showError 
              ? "shake-error 0.5s ease-in-out"
              : isActive && glowColor 
                ? "glow-diffuse 5s ease-in-out infinite" 
                : "none",
          }}
        />
      </div>
    );
  }
);

export default StickyNote;
