import { useState } from 'react';

const PRESETS = [
  '#94a3b8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc',
  '#f472b6', '#fb7185', '#ef4444', '#f97316', '#f59e0b',
  '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [hex, setHex] = useState(value);

  const handleHexChange = (v: string) => {
    setHex(v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => { onChange(c); setHex(c); }}
            className={`w-6 h-6 rounded-full transition-transform hover:scale-110 cursor-pointer ${
              value === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded border border-slate-600 flex-shrink-0" style={{ backgroundColor: value }} />
        <input
          type="text"
          value={hex}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#hex"
          maxLength={7}
          className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>
  );
}
