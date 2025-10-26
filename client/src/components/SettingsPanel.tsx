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
}

export default function SettingsPanel({ colors, onChange }: SettingsPanelProps) {
  const updateColor = (key: keyof ColorSettings, value: string) => {
    onChange({ ...colors, [key]: value });
  };

  return (
    <div className="w-72 p-6 border-l-2 border-border sticky top-0 max-h-screen overflow-y-auto">
      <h2 className="text-lg font-semibold mb-6 uppercase tracking-wide">
        Color Settings
      </h2>

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
  );
}
