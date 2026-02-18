import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ModerationGrid } from "@/components/admin/ModerationGrid";
import Link from "next/link";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function CrewModeratePage({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("events")
    .select("*")
    .eq("crew_token", token)
    .single();

  if (!row) notFound();

  const event = row as unknown as { id: string; name: string };

  return (
    <main className="min-h-dvh bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/crew/${token}`} className="text-white/50 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">Moderate: {event.name}</h1>
        </div>
        <ModerationGrid eventId={event.id} mode="crew" />
      </div>
    </main>
  );
}
