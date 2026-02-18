import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Event } from "@/types/database";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  const events = (rows || []) as unknown as Event[];

  const selfieCounts: Record<string, number> = {};
  for (const event of events) {
    const { count } = await supabase
      .from("selfies")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event.id);
    selfieCounts[event.id] = count || 0;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-white/50 mb-4">No events yet</p>
          <Link href="/admin/events/new" className="text-white underline hover:no-underline">
            Create your first event
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/admin/events/${event.id}`}>
              <Card className="hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{event.name}</h3>
                    <p className="text-white/50 text-sm font-mono">/{event.slug}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      event.is_active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {event.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/50">
                  <span>{selfieCounts[event.id] || 0} selfies</span>
                  {event.starts_at && (
                    <span>{new Date(event.starts_at).toLocaleDateString()}</span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
