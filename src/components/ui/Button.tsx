import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600',
  ghost: 'bg-transparent hover:bg-slate-700 text-slate-300 border-transparent',
  danger: 'bg-red-700 hover:bg-red-600 text-white border-transparent',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-xs rounded',
  md: 'px-4 py-2 text-sm rounded-md',
  lg: 'px-5 py-2.5 text-base rounded-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 font-medium border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}
