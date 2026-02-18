import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Selfie Wall</h1>
      <p className="text-white/60 text-lg mb-8 text-center max-w-md">
        Live event selfie wall — attendees upload selfies and they appear on the big screen in real time.
      </p>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
      >
        Admin Panel
      </Link>
    </main>
  );
}
