import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ModerationGrid } from "@/components/admin/ModerationGrid";
import Link from "next/link";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function AdminModeratePage({ params }: Props) {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("events")
    .select("id, name")
    .eq("id", eventId)
    .single();

  if (!data) notFound();

  const event = data as unknown as { id: string; name: string };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/events/${eventId}`} className="text-white/50 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Moderate: {event.name}</h1>
      </div>
      <ModerationGrid eventId={event.id} mode="admin" />
    </div>
  );
}
