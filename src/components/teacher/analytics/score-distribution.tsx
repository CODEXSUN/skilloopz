"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function ScoreDistribution({ data }: { data: { range: string; count: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="range" className="text-xs text-muted-foreground" />
          <YAxis allowDecimals={false} className="text-xs text-muted-foreground" />
          <Tooltip />
          <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
