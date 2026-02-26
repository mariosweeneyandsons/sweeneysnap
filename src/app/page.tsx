import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-background text-foreground flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">SweeneySnap</h1>
      <p className="text-white/60 text-lg mb-8 text-center max-w-md">
        Live event selfie wall — attendees upload selfies and they appear on the big screen in real time.
      </p>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xs font-medium hover:bg-foreground/90 transition-colors"
      >
        Admin Panel
      </Link>
    </main>
  );
}
