interface LifeDropLogoProps {
  className?: string;
  size?: number;
}

export default function LifeDropLogo({ className = "", size = 26 }: LifeDropLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 2c4 4 6 7.5 6 10.5A6 6 0 1 1 6 12.5C6 9.5 8 6 12 2Z" fill="#ef4444" />
      </svg>
      <span className="text-lg font-extrabold tracking-tight">LifeDrop</span>
    </div>
  );
}
