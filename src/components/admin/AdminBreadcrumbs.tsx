"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const labelMap: Record<string, string> = {
  admin: "Dashboard",
  events: "Events",
  presets: "Presets",
  accounts: "Accounts",
  new: "New",
  moderate: "Moderate",
  "display-settings": "Display Settings",
  "upload-settings": "Upload Settings",
  branding: "Branding",
  analytics: "Analytics",
};

function EventName({ eventId }: { eventId: string }) {
  const event = useQuery(api.events.getById, {
    id: eventId as Id<"events">,
  });
  return <>{event?.name ?? "..."}</>;
}

function PresetName({ presetId }: { presetId: string }) {
  const preset = useQuery(api.presets.getById, {
    id: presetId as Id<"presets">,
  });
  return <>{preset?.name ?? "..."}</>;
}

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const params = useParams<{ eventId?: string; presetId?: string }>();

  // Split: /admin/events/abc/moderate → ["admin", "events", "abc", "moderate"]
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null; // don't show on just /admin

  const crumbs: { label: React.ReactNode; href: string }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const href = "/" + segments.slice(0, i + 1).join("/");

    // Check if this segment is a dynamic ID
    if (seg === params.eventId) {
      crumbs.push({
        label: <EventName eventId={seg} />,
        href,
      });
    } else if (seg === params.presetId) {
      crumbs.push({
        label: <PresetName presetId={seg} />,
        href,
      });
    } else {
      crumbs.push({
        label: labelMap[seg] || seg,
        href,
      });
    }
  }

  return (
    <nav className="flex items-center gap-1.5 text-xs mb-4">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <span className="text-foreground-faint select-none">&gt;</span>
            )}
            {isLast ? (
              <span className="text-label-caps text-foreground-emphasis font-medium">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-label-caps hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
