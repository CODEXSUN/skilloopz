"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#94a3b8", "#6366f1", "#f59e0b", "#10b981"];

export function CompletionFunnel({
  data,
}: {
  data: { enrolled: number; started: number; inProgress: number; completed: number }[];
}) {
  const d = data[0];
  if (!d) return null;
  const items = [
    { stage: "Enrolled", count: d.enrolled },
    { stage: "Started", count: d.started },
    { stage: "In Progress", count: d.inProgress },
    { stage: "Completed", count: d.completed },
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items} layout="vertical">
          <XAxis type="number" className="text-xs text-muted-foreground" />
          <YAxis dataKey="stage" type="category" className="text-xs text-muted-foreground" />
          <Tooltip />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {items.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
