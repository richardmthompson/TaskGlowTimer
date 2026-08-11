import { forwardRef } from "react";

interface StickyNoteProps {
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
  onEnterKey?: () => void;
  showError?: boolean;
}

const StickyNote = forwardRef<HTMLTextAreaElement, StickyNoteProps>(
  function StickyNote(
    { value, onChange, isActive, onEnterKey, showError = false },
    ref
  ) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onEnterKey?.();
      }
    };

    return (
      <div className="relative">
        <textarea
          ref={ref}
          data-testid="input-current-task"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What are you working on?"
          className={`w-full min-h-32 h-32 p-6 text-lg font-bold resize-none rounded-card border-thin bg-primary text-primary-foreground placeholder:text-primary-foreground/60 dark:bg-muted dark:text-card-foreground dark:placeholder:text-muted-foreground transition-transform duration-fast ease-neo ${
            showError
              ? "border-destructive motion-safe:animate-shake-error"
              : isActive
                ? "border-[hsl(var(--panel-foreground))] -translate-x-px -translate-y-px"
                : "panel-hairline"
          }`}
        />
      </div>
    );
  }
);

export default StickyNote;
