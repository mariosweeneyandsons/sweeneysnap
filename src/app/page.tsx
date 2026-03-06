import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="min-h-dvh bg-background text-foreground flex flex-col items-center justify-center p-8 bp-grid"
    >
      {/* Title block */}
      <div className="border border-border rounded-xs px-8 py-6 mb-8 bg-surface/50 backdrop-blur-sm text-center max-w-lg">
        <div
          className="text-[10px] text-label mb-2"
          style={{ fontVariant: "small-caps", letterSpacing: "0.05em" }}
        >
          project
        </div>
        <h1
          className="text-3xl font-bold text-foreground-emphasis tracking-heading mb-4"
          style={{ fontVariant: "small-caps" }}
        >
          SweeneySnap
        </h1>
        <div className="w-12 h-[1px] bg-border-strong mx-auto mb-4" />
        <p className="text-foreground-muted text-sm leading-relaxed">
          Live event selfie wall. Attendees upload selfies and they appear on the big screen in real time.
        </p>
      </div>

      {/* Action */}
      <Link
        href="/admin"
        className="border-2 border-border-strong rounded-xs px-6 py-2.5 text-sm text-foreground-emphasis hover:bg-surface-hover transition-colors"
        style={{ fontVariant: "small-caps", letterSpacing: "0.05em" }}
      >
        admin panel
      </Link>
    </main>
  );
}
