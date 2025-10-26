import { useState } from "react";
import SettingsPanel, { ColorSettings } from "../SettingsPanel";

export default function SettingsPanelExample() {
  const [colors, setColors] = useState<ColorSettings>({
    stickyBackground: "#fef3c7",
    completedBackground: "#d1fae5",
    clockDefault: "#e5e7eb",
    clockElapsed: "#3b82f6",
    outline: "#d97706",
  });

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-8 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Main content area</p>
      </div>
      <SettingsPanel
        colors={colors}
        onChange={(newColors) => {
          setColors(newColors);
          console.log("Colors updated:", newColors);
        }}
      />
    </div>
  );
}
