"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function EngagementChart({ data }: { data: { week: string; score: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis dataKey="week" className="text-xs text-muted-foreground" />
          <YAxis domain={[0, 100]} className="text-xs text-muted-foreground" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#06b6d4"
            fill="url(#engagementGradient)"
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
