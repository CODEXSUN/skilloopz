"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";

interface ParentRecord {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  childrenCount: number;
  childrenNames: string[];
}

interface AdminParentsClientProps {
  parents: ParentRecord[];
}

export function AdminParentsClient({ parents }: AdminParentsClientProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return parents;
    const q = search.toLowerCase();
    return parents.filter(
      (p) =>
        p.fullName?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q),
    );
  }, [parents, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Parents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all platform parents.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search parents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)]"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} parent{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No parents found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Children</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Children Names</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((parent) => (
                <tr key={parent.id} className="group transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10 text-xs font-bold text-primary-400 shrink-0">
                        {parent.fullName?.charAt(0)?.toUpperCase() ?? parent.email?.charAt(0)?.toUpperCase() ?? "P"}
                      </div>
                      <span className="font-medium text-foreground">
                        {parent.fullName ?? "Unnamed"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{parent.email ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground">{parent.childrenCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {parent.childrenNames.length > 0 ? parent.childrenNames.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {format(new Date(parent.createdAt), "MMM d, yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
