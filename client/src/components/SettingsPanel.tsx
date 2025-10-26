import { ChevronDown, ChevronUp } from "lucide-react";
import ColorPicker from "./ColorPicker";

export interface ColorSettings {
  stickyBackground: string;
  completedBackground: string;
  clockDefault: string;
  clockElapsed: string;
  outline: string;
}

interface SettingsPanelProps {
  colors: ColorSettings;
  onChange: (colors: ColorSettings) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function SettingsPanel({ colors, onChange, isExpanded, onToggle }: SettingsPanelProps) {
  const updateColor = (key: keyof ColorSettings, value: string) => {
    onChange({ ...colors, [key]: value });
  };

  return (
    <>
      {isExpanded && (
        <div className="fixed bottom-16 right-0 z-40 w-80 max-h-[calc(90vh-4rem)] border-2 border-b-0 border-border rounded-t-xl bg-card shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
            <ColorPicker
              label="Sticky Background"
              value={colors.stickyBackground}
              onChange={(val) => updateColor("stickyBackground", val)}
            />

            <ColorPicker
              label="Completed Items Background"
              value={colors.completedBackground}
              onChange={(val) => updateColor("completedBackground", val)}
            />

            <ColorPicker
              label="Clock Face Default"
              value={colors.clockDefault}
              onChange={(val) => updateColor("clockDefault", val)}
            />

            <ColorPicker
              label="Clock Face Elapsed"
              value={colors.clockElapsed}
              onChange={(val) => updateColor("clockElapsed", val)}
            />

            <ColorPicker
              label="Outline Color"
              value={colors.outline}
              onChange={(val) => updateColor("outline", val)}
            />
          </div>
        </div>
      )}

      <div className="fixed bottom-0 right-0 z-50">
        <button
          data-testid={isExpanded ? "button-collapse-settings" : "button-expand-settings"}
          onClick={onToggle}
          className="px-6 py-3 border-2 border-border rounded-t-lg bg-card hover-elevate active-elevate-2 flex items-center gap-2 shadow-lg"
        >
          <span className="text-sm font-semibold uppercase tracking-wide">
            Color Settings
          </span>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    </>
  );
}
