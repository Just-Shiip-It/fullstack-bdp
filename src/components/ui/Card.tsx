import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: 'glass' | 'solid';
}

export default function Card({ children, className = '', variant = 'glass', ...props }: CardProps) {
  const baseClasses = 'rounded-2xl border border-white/10';
  const variantClasses = {
    glass: 'glass',
    solid: 'bg-white/5'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
