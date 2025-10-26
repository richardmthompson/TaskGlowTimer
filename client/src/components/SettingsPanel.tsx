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

  if (!isExpanded) {
    return (
      <div className="w-auto">
        <button
          data-testid="button-expand-settings"
          onClick={onToggle}
          className="h-full px-4 py-6 border-l-2 border-border hover-elevate flex items-start gap-2 bg-card"
        >
          <span className="text-sm font-semibold uppercase tracking-wide writing-mode-vertical transform rotate-180">
            Color Settings
          </span>
          <ChevronUp className="w-4 h-4 mt-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 border-l-2 border-border bg-card">
      <div className="p-6 sticky top-0 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold uppercase tracking-wide">
            Color Settings
          </h2>
          <button
            data-testid="button-collapse-settings"
            onClick={onToggle}
            className="p-1 hover-elevate rounded-md"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
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
    </div>
  );
}
