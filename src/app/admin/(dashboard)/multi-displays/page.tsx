"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { EventsListSkeleton } from "@/components/admin/skeletons/EventsListSkeleton";
import { getSiteUrl } from "@/lib/config";

export default function MultiDisplaysPage() {
  const { toast } = useToast();
  const displays = useQuery(api.multiEventDisplays.list);
  const events = useQuery(api.events.list, { includeArchived: false });
  const createDisplay = useMutation(api.multiEventDisplays.create);
  const removeDisplay = useMutation(api.multiEventDisplays.remove);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [showEventBadges, setShowEventBadges] = useState(true);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim() || selectedEventIds.size === 0) {
      toast("Fill in all fields and select at least one event", "error");
      return;
    }
    setCreating(true);
    try {
      await createDisplay({
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        eventIds: Array.from(selectedEventIds) as Id<"events">[],
        showEventBadges,
        displayConfig: {
          gridColumns: 4,
          swapInterval: 6,
          transition: "fade",
          backgroundColor: "#000000",
          showNames: true,
          showMessages: false,
          layoutMode: "grid",
        },
      });
      toast("Multi-event display created", "success");
      setShowForm(false);
      setName("");
      setSlug("");
      setSelectedEventIds(new Set());
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this multi-event display?")) return;
    try {
      await removeDisplay({ id: id as Id<"multiEventDisplays"> });
      toast("Display deleted", "success");
    } catch {
      toast("Failed to delete", "error");
    }
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const siteUrl = getSiteUrl();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Multi-Event Displays</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New Display"}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Create Multi-Event Display</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Festival Weekend"
                className="w-full px-3 py-2 rounded-lg bg-input-bg border border-border text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. festival-weekend"
                className="w-full px-3 py-2 rounded-lg bg-input-bg border border-border text-foreground"
              />
              {slug && (
                <p className="text-xs text-foreground-faint mt-1">
                  {siteUrl}/display/multi/{slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-2">
                Select Events
              </label>
              {!events ? (
                <p className="text-sm text-foreground-muted">Loading events...</p>
              ) : events.length === 0 ? (
                <p className="text-sm text-foreground-muted">No events available</p>
              ) : (
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {events.map((event) => (
                    <label
                      key={event._id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedEventIds.has(event._id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-foreground-faint"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEventIds.has(event._id)}
                        onChange={() => toggleEvent(event._id)}
                        className="rounded"
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.primaryColor }}
                        />
                        <span className="text-sm font-medium truncate">{event.name}</span>
                        <span className="text-xs text-foreground-faint">/{event.slug}</span>
                      </div>
                      {!event.isActive && (
                        <span className="text-xs text-foreground-faint">Inactive</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showEventBadges}
                onChange={(e) => setShowEventBadges(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show event name badges on selfies</span>
            </label>
            <Button
              onClick={handleCreate}
              disabled={creating || !name.trim() || !slug.trim() || selectedEventIds.size === 0}
            >
              {creating ? "Creating..." : "Create Display"}
            </Button>
          </div>
        </Card>
      )}

      {/* List */}
      {!displays ? (
        <EventsListSkeleton />
      ) : displays.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-foreground-muted mb-4">No multi-event displays yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-foreground underline hover:no-underline"
          >
            Create your first multi-event display
          </button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displays.map((display) => (
            <Card key={display._id} className="group relative">
              <div className="mb-3">
                <h3 className="font-semibold text-lg">{display.name}</h3>
                <p className="text-foreground-muted text-sm">
                  /{display.slug} &middot; {display.eventIds.length} event{display.eventIds.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/display/multi/${display.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-foreground-muted hover:text-foreground underline"
                >
                  Open Display
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${siteUrl}/display/multi/${display.slug}`
                    );
                    toast("URL copied", "success");
                  }}
                  className="text-xs text-foreground-muted hover:text-foreground underline"
                >
                  Copy URL
                </button>
              </div>
              <button
                onClick={() => handleDelete(display._id)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 text-sm"
              >
                Delete
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
