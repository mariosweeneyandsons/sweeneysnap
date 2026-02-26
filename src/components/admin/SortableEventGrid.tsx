"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

interface EventItem {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  archived?: boolean;
  startsAt?: number;
  endsAt?: number;
  sortOrder?: number;
}

interface SelfieCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface SortableEventGridProps {
  events: EventItem[];
  selfieCounts?: Record<string, SelfieCounts>;
  getScheduleBadge: (event: EventItem) => { label: string; color: string } | null;
}

function SortableEventCard({
  event,
  counts,
  scheduleBadge,
}: {
  event: EventItem;
  counts?: SelfieCounts;
  scheduleBadge: { label: string; color: string } | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`hover:bg-secondary transition-colors ${
          event.archived ? "opacity-50" : ""
        }`}
      >
        <div className="flex items-start gap-2">
          <button
            className="mt-1 cursor-grab active:cursor-grabbing text-foreground-faint hover:text-foreground-muted touch-none"
            {...attributes}
            {...listeners}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </button>

          <Link href={`/admin/events/${event._id}`} className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{event.name}</h3>
                <p className="text-foreground-faint text-sm font-mono">/{event.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                {event.archived && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-foreground-faint">
                    Archived
                  </span>
                )}
                {scheduleBadge && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${scheduleBadge.color}`}>
                    {scheduleBadge.label}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    event.isActive
                      ? "bg-success-bg text-success"
                      : "bg-secondary text-foreground-faint"
                  }`}
                >
                  {event.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-foreground-faint">
              {event.startsAt && (
                <span>{new Date(event.startsAt).toLocaleDateString()}</span>
              )}
              {counts && (
                <div className="flex items-center gap-2 text-xs">
                  <span>{counts.total} selfies</span>
                  {counts.approved > 0 && (
                    <span className="text-success">{counts.approved} approved</span>
                  )}
                  {counts.pending > 0 && (
                    <span className="text-warning">{counts.pending} pending</span>
                  )}
                </div>
              )}
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export function SortableEventGrid({
  events,
  selfieCounts,
  getScheduleBadge,
}: SortableEventGridProps) {
  const [items, setItems] = useState(events);
  const updateSortOrders = useMutation(api.events.updateSortOrders);

  // Sync items when events change from server
  if (events.length !== items.length || events.some((e, i) => e._id !== items[i]?._id)) {
    setItems(events);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((e) => e._id === active.id);
    const newIndex = items.findIndex((e) => e._id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    // Save new sort orders
    const sortUpdates = newItems.map((item, index) => ({
      id: item._id as Id<"events">,
      sortOrder: index,
    }));

    await updateSortOrders({ items: sortUpdates });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((e) => e._id)} strategy={rectSortingStrategy}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((event) => (
            <SortableEventCard
              key={event._id}
              event={event}
              counts={selfieCounts?.[event._id]}
              scheduleBadge={getScheduleBadge(event)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
