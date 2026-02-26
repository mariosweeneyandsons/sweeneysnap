"use client";

interface AnimatedBackgroundProps {
  primaryColor: string;
}

export function AnimatedBackground({ primaryColor }: AnimatedBackgroundProps) {
  return (
    <div
      className="absolute inset-0 animate-gradient-shift"
      style={{
        background: `linear-gradient(-45deg, ${primaryColor}, #1a1a2e, ${primaryColor}88, #0f0f23)`,
        backgroundSize: "400% 400%",
      }}
    >
      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift {
          animation: gradient-shift 15s ease infinite;
        }
      `}</style>
    </div>
  );
}
