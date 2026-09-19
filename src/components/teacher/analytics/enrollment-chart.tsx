"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function EnrollmentChart({ data }: { data: { month: string; count: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis dataKey="month" className="text-xs text-muted-foreground" />
          <YAxis allowDecimals={false} className="text-xs text-muted-foreground" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={{ fill: "#7c3aed", r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
