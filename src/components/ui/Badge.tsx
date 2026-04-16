import type { ReactNode } from 'react';

interface BadgeProps {
  color?: string;
  children: ReactNode;
  className?: string;
}

export function Badge({ color, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={color ? { backgroundColor: `${color}22`, color, border: `1px solid ${color}44` } : {}}
    >
      {children}
    </span>
  );
}

export function StatusDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
    />
  );
}
