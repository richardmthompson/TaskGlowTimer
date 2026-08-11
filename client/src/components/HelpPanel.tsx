import { ChevronDown, ChevronUp } from "lucide-react";
import { Kbd } from "./ui/Kbd";

interface HelpPanelProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export default function HelpPanel({ isExpanded, onToggle }: HelpPanelProps) {
  const shortcuts = [
    {
      category: "Task Input & Timer Control",
      items: [
        { key: "t", action: "Focus main task sticky note for editing" },
        { key: "q", action: "Focus queue input field for adding tasks to queue" },
        { key: "g", action: "Focus goal input field for adding goals to stack" },
        { key: "Enter", action: "Start the clock (from sticky note)" },
        { key: "Enter", action: "Move queued task to sticky note (when queued task is selected)" },
        { key: "Enter", action: "Promote goal from stack to current goal (when goal is selected)" },
        { key: "Space", action: "Pause and resume clock (toggle)" },
        { key: "Cmd+Enter / Ctrl+Enter", action: "Complete current task and add to completed list" },
        { key: "T", action: "Move completed task back to sticky (only if sticky is empty)" },
      ],
    },
    {
      category: "Navigation",
      items: [
        { key: "c", action: "Select first completed task" },
        { key: "Q", action: "Select first queued task" },
        { key: "G", action: "Select first goal in stack" },
        { key: "↑ / ↓ or k / j", action: "Navigate through selected list (completed, queued, or goals)" },
      ],
    },
    {
      category: "Task Management",
      items: [
        { key: "d", action: "Delete selected task from completed or queued list" },
      ],
    },
    {
      category: "General",
      items: [
        { key: "Shift+M", action: "Toggle dark/light theme" },
        { key: "Escape", action: "Deselect any input field, deselect completed/queued task highlights" },
      ],
    },
  ];

  return (
    <>
      {isExpanded && (
        <div className="fixed bottom-24 right-6 z-40 w-80 max-h-[calc(100vh-8rem)] rounded-card border-frame border-border bg-card text-card-foreground shadow-neo-lg animate-in slide-in-from-bottom duration-slow">
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
            <h2 className="font-display text-lg font-bold tracking-tight mb-4">Keyboard Shortcuts</h2>

            {shortcuts.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-sm font-mono font-bold uppercase tracking-label text-muted-foreground">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex gap-3">
                      <Kbd size="wide" className="font-bold">
                        {item.key}
                      </Kbd>
                      <span className="text-sm text-foreground leading-6">
                        {item.action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-50">
        <button
          data-testid={isExpanded ? "button-collapse-help" : "button-expand-help"}
          onClick={onToggle}
          className="min-h-11 px-6 py-3 rounded-md border-frame border-border bg-card text-card-foreground hover-elevate active-elevate-2 flex items-center gap-2 shadow-neo"
        >
          <span className="text-sm font-mono font-bold uppercase tracking-label">
            Help
          </span>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    </>
  );
}
