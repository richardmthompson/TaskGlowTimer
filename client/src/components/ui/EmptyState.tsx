import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  headline: string;
  /** ReactNode so hints keep their <Kbd> chips and <br /> exactly as before. */
  hint: ReactNode;
  /** Carries the per-column vertical padding (py-6 default, py-4 for the queue). */
  className?: string;
}

/**
 * Shared empty-list block. Collapses the three copy-pasted empty states
 * (goals stack, task queue, completed list) into one primitive that emits the
 * same mono/uppercase/muted shell.
 */
export function EmptyState({ headline, hint, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "py-6 font-mono text-[10px] uppercase tracking-label text-muted-foreground leading-relaxed",
        className,
      )}
    >
      <div className="font-bold">{headline}</div>
      <div className="mt-2">{hint}</div>
    </div>
  );
}
