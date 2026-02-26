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
      <div className="flex items-center justify-center h-64 text-white/30 text-sm">
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
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis
          dataKey="label"
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <YAxis
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0,0,0,0.9)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8,
            color: "white",
          }}
          labelStyle={{ color: "rgba(255,255,255,0.7)" }}
          formatter={(value: number) => [value, "Uploads"]}
          labelFormatter={(label: string) => `Hour: ${label}`}
        />
        <Bar dataKey="count" fill="rgba(255,255,255,0.6)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
