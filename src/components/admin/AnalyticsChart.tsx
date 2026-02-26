"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface UploadTimelineProps {
  data: { hour: string; count: number }[];
}

export function UploadTimeline({ data }: UploadTimelineProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-foreground-faint text-sm">
        No upload data yet
      </div>
    );
  }

  // Format hour labels to be shorter
  const formatted = data.map((d) => ({
    ...d,
    label: d.hour.split(" ")[1] || d.hour,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formatted} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--foreground-faint)", fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
        />
        <YAxis
          tick={{ fill: "var(--foreground-faint)", fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--foreground)",
          }}
          labelStyle={{ color: "var(--foreground-muted)" }}
          formatter={(value: unknown) => [String(value), "Uploads"]}
          labelFormatter={(label: unknown) => `Hour: ${String(label)}`}
        />
        <Bar dataKey="count" fill="var(--foreground-muted)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
