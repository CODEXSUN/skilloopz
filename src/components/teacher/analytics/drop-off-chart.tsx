"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function DropOffChart({ data }: { data: { lessonId: string; count: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <XAxis type="number" className="text-xs text-muted-foreground" />
          <YAxis
            dataKey="lessonId"
            type="category"
            className="text-xs text-muted-foreground"
            width={100}
            tickFormatter={(v) => v.slice(0, 8) + "…"}
          />
          <Tooltip />
          <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
