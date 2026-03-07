"use client";

import { LAYOUT_TEMPLATES, LayoutTemplate } from "@/lib/layoutTemplates";

interface LayoutPickerProps {
  value: string;
  onChange: (templateId: string) => void;
}

const THUMB_COLORS = [
  "#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#8b5cf6",
  "#ef4444", "#06b6d4", "#f97316", "#22c55e", "#a855f7",
];

function TemplateThumbnail({ template, selected }: { template: LayoutTemplate; selected: boolean }) {
  const { columns, rows, slots } = template;

  return (
    <div
      className={`aspect-video rounded-xs border-2 p-1 transition-colors cursor-pointer ${
        selected
          ? "border-primary bg-primary/10"
          : "border-border hover:border-foreground-faint"
      }`}
    >
      <div
        className="w-full h-full gap-0.5"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {slots.map((slot, i) => (
          <div
            key={i}
            className="rounded-[2px]"
            style={{
              gridColumn: `${slot.colStart} / span ${slot.colSpan}`,
              gridRow: `${slot.rowStart} / span ${slot.rowSpan}`,
              backgroundColor: THUMB_COLORS[i % THUMB_COLORS.length],
              opacity: selected ? 0.8 : 0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function LayoutPicker({ value, onChange }: LayoutPickerProps) {
  const gridTemplates = LAYOUT_TEMPLATES.filter((t) => t.category === "grid");
  const creativeTemplates = LAYOUT_TEMPLATES.filter((t) => t.category === "creative");

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-faint mb-2">Grid Layouts</h4>
        <div className="grid grid-cols-5 gap-2">
          {gridTemplates.map((t) => (
            <button key={t.id} type="button" onClick={() => onChange(t.id)} className="text-left">
              <TemplateThumbnail template={t} selected={value === t.id} />
              <p className={`text-[10px] mt-0.5 text-center ${value === t.id ? "text-primary font-medium" : "text-foreground-faint"}`}>
                {t.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-faint mb-2">Creative Layouts</h4>
        <div className="grid grid-cols-3 gap-2">
          {creativeTemplates.map((t) => (
            <button key={t.id} type="button" onClick={() => onChange(t.id)} className="text-left">
              <TemplateThumbnail template={t} selected={value === t.id} />
              <p className={`text-[10px] mt-0.5 text-center ${value === t.id ? "text-primary font-medium" : "text-foreground-faint"}`}>
                {t.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
