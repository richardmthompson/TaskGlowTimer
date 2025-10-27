import { ChevronDown, ChevronUp } from "lucide-react";

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
        { key: "g", action: "Focus goal input field for adding goals" },
        { key: "Enter", action: "Start the clock (from sticky note)" },
        { key: "Enter", action: "Move queued task to sticky note (when queued task is selected)" },
        { key: "Space", action: "Pause and resume clock (toggle)" },
        { key: "Cmd+Enter / Ctrl+Enter", action: "Complete current task and add to completed list" },
        { key: "T", action: "Move completed task back to sticky (only if sticky is empty)" },
      ],
    },
    {
      category: "Task Navigation",
      items: [
        { key: "c", action: "Select first completed task (shows green glow)" },
        { key: "Q", action: "Select first queued task (shows lighter blue)" },
        { key: "↑ / ↓ or k / j", action: "Navigate through selected task list (completed or queued)" },
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
        { key: "Escape", action: "Deselect any input field, deselect completed/queued task highlights" },
      ],
    },
  ];

  return (
    <>
      {isExpanded && (
        <div className="fixed bottom-16 left-0 z-40 w-80 max-h-[calc(90vh-4rem)] border-2 border-b-0 border-border rounded-t-xl bg-card shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
            <h2 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h2>
            
            {shortcuts.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex gap-3">
                      <kbd className="min-w-[80px] px-2 py-1 text-xs font-mono font-semibold bg-muted border border-border rounded text-center flex-shrink-0">
                        {item.key}
                      </kbd>
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

      <div className="fixed bottom-0 left-0 z-50">
        <button
          data-testid={isExpanded ? "button-collapse-help" : "button-expand-help"}
          onClick={onToggle}
          className="px-6 py-3 border-2 border-border rounded-t-lg bg-card hover-elevate active-elevate-2 flex items-center gap-2 shadow-lg"
        >
          <span className="text-sm font-semibold uppercase tracking-wide">
            Help
          </span>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    </>
  );
}
