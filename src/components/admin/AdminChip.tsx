import { ReactNode } from 'react';

interface AdminChipProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export default function AdminChip({ children, variant = 'default', className = '' }: AdminChipProps) {
  const variantClasses = {
    default: 'bg-slate-500/20 border-slate-500/30 text-slate-300',
    success: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    warning: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
    danger: 'bg-red-500/20 border-red-500/30 text-red-300',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-300'
  };

  return (
    <span className={`chip ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
