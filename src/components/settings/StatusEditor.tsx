import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ColorPicker } from './ColorPicker';
import type { StatusConfig } from '@/types/settings';

interface StatusEditorProps {
  status: StatusConfig;
  onSave: (patch: Partial<StatusConfig>) => void;
  onCancel: () => void;
}

export function StatusEditor({ status, onSave, onCancel }: StatusEditorProps) {
  const [name, setName] = useState(status.name);
  const [color, setColor] = useState(status.color);
  const [isTerminal, setIsTerminal] = useState(status.isTerminal);
  const [isDone, setIsDone] = useState(status.isDone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), color, isTerminal, isDone: isTerminal ? isDone : false });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex flex-col gap-3">
      <Input
        label="Status name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        maxLength={40}
      />
      <div>
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide block mb-2">Color</label>
        <ColorPicker value={color} onChange={setColor} />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
          <input
            type="checkbox"
            checked={isTerminal}
            onChange={(e) => setIsTerminal(e.target.checked)}
            className="w-4 h-4 rounded accent-indigo-500"
          />
          Terminal (closes task, triggers confetti)
        </label>
      </div>
      {isTerminal && (
        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 ml-6">
          <input
            type="checkbox"
            checked={isDone}
            onChange={(e) => setIsDone(e.target.checked)}
            className="w-4 h-4 rounded accent-indigo-500"
          />
          Mark as "Done" (success state)
        </label>
      )}
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm">Save</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
