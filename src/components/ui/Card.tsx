interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 ${className}`}>
      {children}
    </div>
  );
}
