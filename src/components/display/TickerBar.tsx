"use client";

interface TickerBarProps {
  text: string;
}

export function TickerBar({ text }: TickerBarProps) {
  // Repeat text enough times to fill the screen during scroll
  const repeated = `${text}  \u2022  `.repeat(8);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-black/60 backdrop-blur-sm overflow-hidden">
      <div className="animate-ticker whitespace-nowrap py-3 text-white/80 text-lg font-medium">
        {repeated}
      </div>
      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
