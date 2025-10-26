interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold block" htmlFor={`color-${label}`}>
        {label}
      </label>
      <input
        id={`color-${label}`}
        data-testid={`input-color-${label.toLowerCase().replace(/\s+/g, "-")}`}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 rounded-lg cursor-pointer border-2 border-border"
      />
    </div>
  );
}
