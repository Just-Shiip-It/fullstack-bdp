import { ReactNode } from 'react';

interface AdminCardProps {
  children: ReactNode;
  className?: string;
  beam?: boolean;
}

export default function AdminCard({ children, className = '', beam = false }: AdminCardProps) {
  return (
    <div className={`card ${beam ? 'beam' : ''} ${className}`}>
      {children}
    </div>
  );
}
