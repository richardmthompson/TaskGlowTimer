import { useState } from "react";
import ColorPicker from "../ColorPicker";

export default function ColorPickerExample() {
  const [color, setColor] = useState("#3b82f6");

  return (
    <div className="p-8 max-w-xs">
      <ColorPicker
        label="Primary Color"
        value={color}
        onChange={(newColor) => {
          setColor(newColor);
          console.log("Color changed to:", newColor);
        }}
      />
      <div
        className="mt-4 h-20 rounded-lg border-2"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
