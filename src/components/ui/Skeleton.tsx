export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`animate-pulse bg-secondary rounded-xs ${className}`} style={style} />
  );
}
