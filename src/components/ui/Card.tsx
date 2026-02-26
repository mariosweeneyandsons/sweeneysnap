interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl border border-card-border bg-card-bg backdrop-blur-sm p-6 ${className}`}>
      {children}
    </div>
  );
}
