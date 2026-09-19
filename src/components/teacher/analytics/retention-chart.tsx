"use client";

import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

export function RetentionChart({ data }: { data: { week: string; active: number; retained: number; rate: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis dataKey="week" className="text-xs text-muted-foreground" />
          <YAxis yAxisId="left" allowDecimals={false} className="text-xs text-muted-foreground" />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            className="text-xs text-muted-foreground"
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip />
          <Bar yAxisId="left" dataKey="active" name="Active" fill="rgba(79,124,255,0.6)" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="retained" name="Retained" fill="rgba(52,211,153,0.6)" radius={[4, 4, 0, 0]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="rate"
            name="Rate"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: "#f59e0b", r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
