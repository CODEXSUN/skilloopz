"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, ChevronUp, ChevronDown, Plus, X, GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  order: number;
  visible: boolean;
  settings: Record<string, unknown>;
}

interface RoleWidgets {
  [role: string]: WidgetConfig[];
}

const WIDGET_CATALOG: { type: string; title: string; description: string }[] = [
  { type: "stats", title: "Stats Cards", description: "Summary counters (users, courses, etc.)" },
  { type: "list", title: "List", description: "Scrollable list of items" },
  { type: "chart", title: "Chart", description: "Line, bar, or pie chart" },
  { type: "grid", title: "Grid", description: "Card grid layout" },
  { type: "progress", title: "Progress", description: "Progress bar or ring" },
  { type: "calendar", title: "Calendar", description: "Date picker or event calendar" },
  { type: "table", title: "Table", description: "Data table with sort/filter" },
  { type: "feed", title: "Feed", description: "Activity feed timeline" },
];

const DEFAULT_WIDGETS: RoleWidgets = {
  student: [
    { id: "stats-cards", type: "stats", title: "Stats Cards", order: 0, visible: true, settings: {} },
    { id: "my-courses", type: "list", title: "My Courses", order: 1, visible: true, settings: {} },
    { id: "continue-learning", type: "list", title: "Continue Learning", order: 2, visible: true, settings: {} },
    { id: "achievements", type: "grid", title: "Achievements", order: 3, visible: true, settings: {} },
    { id: "leaderboard", type: "chart", title: "Leaderboard", order: 4, visible: true, settings: {} },
    { id: "notifications", type: "list", title: "Notifications", order: 5, visible: true, settings: {} },
    { id: "time-spent", type: "chart", title: "Time Spent", order: 6, visible: true, settings: {} },
  ],
  teacher: [
    { id: "stats-cards", type: "stats", title: "Stats Cards", order: 0, visible: true, settings: {} },
    { id: "my-courses", type: "list", title: "My Courses", order: 1, visible: true, settings: {} },
    { id: "students", type: "list", title: "Students", order: 2, visible: true, settings: {} },
    { id: "analytics", type: "chart", title: "Analytics", order: 3, visible: true, settings: {} },
    { id: "recent-activity", type: "feed", title: "Recent Activity", order: 4, visible: true, settings: {} },
  ],
  parent: [
    { id: "children-overview", type: "stats", title: "Children Overview", order: 0, visible: true, settings: {} },
    { id: "reports", type: "list", title: "Reports", order: 1, visible: true, settings: {} },
    { id: "achievements", type: "grid", title: "Achievements", order: 2, visible: true, settings: {} },
    { id: "streaks", type: "progress", title: "Streaks", order: 3, visible: true, settings: {} },
  ],
  admin: [
    { id: "stats-cards", type: "stats", title: "Stats Cards", order: 0, visible: true, settings: {} },
    { id: "users-overview", type: "chart", title: "Users Overview", order: 1, visible: true, settings: {} },
    { id: "recent-reports", type: "list", title: "Recent Reports", order: 2, visible: true, settings: {} },
    { id: "system-health", type: "stats", title: "System Health", order: 3, visible: true, settings: {} },
  ],
};

const ROLES = ["student", "teacher", "parent", "admin"];

export function DashboardBuilderPage() {
  const [widgetsByRole, setWidgetsByRole] = useState<RoleWidgets>({});
  const [activeRole, setActiveRole] = useState("student");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCatalog, setShowCatalog] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard-config")
      .then((res) => res.json())
      .then((data) => {
        const merged: RoleWidgets = {};
        for (const role of ROLES) {
          const existing = data.find((c: { role: string }) => c.role === role);
          const defaults = DEFAULT_WIDGETS[role] ?? [];
          if (existing) {
            const parsed: WidgetConfig[] = JSON.parse(existing.widgets);
            merged[role] = parsed.map((w) => {
              const def = defaults.find((d) => d.id === w.id);
              return def ? { ...def, ...w } : w;
            });
          } else {
            merged[role] = [...defaults];
          }
        }
        setWidgetsByRole(merged);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const currentWidgets = widgetsByRole[activeRole] ?? DEFAULT_WIDGETS[activeRole] ?? [];

  function toggleWidget(id: string) {
    setWidgetsByRole((prev) => {
      const widgets = [...(prev[activeRole] ?? [])];
      const idx = widgets.findIndex((w) => w.id === id);
      if (idx !== -1) widgets[idx] = { ...widgets[idx], visible: !widgets[idx].visible };
      return { ...prev, [activeRole]: widgets };
    });
  }

  function moveUp(id: string) {
    setWidgetsByRole((prev) => {
      const widgets = [...(prev[activeRole] ?? [])];
      const idx = widgets.findIndex((w) => w.id === id);
      if (idx <= 0) return prev;
      [widgets[idx - 1], widgets[idx]] = [widgets[idx], widgets[idx - 1]];
      return { ...prev, [activeRole]: widgets.map((w, i) => ({ ...w, order: i })) };
    });
  }

  function moveDown(id: string) {
    setWidgetsByRole((prev) => {
      const widgets = [...(prev[activeRole] ?? [])];
      const idx = widgets.findIndex((w) => w.id === id);
      if (idx === -1 || idx >= widgets.length - 1) return prev;
      [widgets[idx], widgets[idx + 1]] = [widgets[idx + 1], widgets[idx]];
      return { ...prev, [activeRole]: widgets.map((w, i) => ({ ...w, order: i })) };
    });
  }

  function removeWidget(id: string) {
    setWidgetsByRole((prev) => ({
      ...prev,
      [activeRole]: (prev[activeRole] ?? []).filter((w) => w.id !== id),
    }));
  }

  function addWidget(type: string, title: string) {
    const existing = widgetsByRole[activeRole] ?? [];
    setWidgetsByRole((prev) => ({
      ...prev,
      [activeRole]: [
        ...(prev[activeRole] ?? []),
        {
          id: `widget-${Date.now()}`,
          type,
          title,
          order: existing.length,
          visible: true,
          settings: {},
        },
      ],
    }));
    setShowCatalog(false);
  }

  function updateTitle(id: string, title: string) {
    setWidgetsByRole((prev) => {
      const widgets = [...(prev[activeRole] ?? [])];
      const idx = widgets.findIndex((w) => w.id === id);
      if (idx !== -1) widgets[idx] = { ...widgets[idx], title };
      return { ...prev, [activeRole]: widgets };
    });
  }

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      for (const role of ROLES) {
        const widgets = widgetsByRole[role];
        if (!widgets) continue;
        const res = await fetch("/api/admin/dashboard-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, widgets }),
        });
        if (!res.ok) throw new Error(`Failed to save config for ${role}`);
      }
    } catch {
      alert("Failed to save dashboard config");
    } finally {
      setIsSaving(false);
    }
  }, [widgetsByRole]);

  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-tertiary-foreground">
        Loading dashboard config...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Builder</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure which widgets appear on each role&apos;s dashboard.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </Button>
      </div>

      <div className="flex gap-2">
        {ROLES.map((role) => (
          <Button
            key={role}
            variant={activeRole === role ? "default" : "outline"}
            onClick={() => { setActiveRole(role); setShowCatalog(false); }}
            className="capitalize"
          >
            {role}
          </Button>
        ))}
      </div>

      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCatalog(!showCatalog)}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Widget
        </Button>

        {showCatalog && (
          <Card className="absolute left-0 top-full z-10 mt-1 w-72 p-2 shadow-xl">
            <div className="space-y-1">
              {WIDGET_CATALOG.map((w) => (
                <button
                  key={w.type}
                  onClick={() => addWidget(w.type, w.title)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{w.title}</p>
                    <p className="text-xs text-muted-foreground">{w.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="space-y-2">
        {currentWidgets.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No widgets configured for this role. Click &quot;Add Widget&quot; to get started.
          </p>
        ) : (
          currentWidgets.map((widget, idx) => (
            <Card key={widget.id}>
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30" />
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveUp(widget.id)}
                      disabled={idx === 0}
                      className="flex h-4 w-4 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => moveDown(widget.id)}
                      disabled={idx === currentWidgets.length - 1}
                      className="flex h-4 w-4 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    {editingTitle === widget.id ? (
                      <Input
                        value={widget.title}
                        onChange={(e) => updateTitle(widget.id, e.target.value)}
                        onBlur={() => setEditingTitle(null)}
                        onKeyDown={(e) => e.key === "Enter" && setEditingTitle(null)}
                        className="h-7 text-sm px-2"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => setEditingTitle(widget.id)}
                        className="text-sm font-medium text-foreground hover:text-primary-400 transition-colors"
                      >
                        {widget.title}
                      </button>
                    )}
                    <p className="text-xs text-muted-foreground capitalize">{widget.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Switch checked={widget.visible} onCheckedChange={() => toggleWidget(widget.id)} />
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="rounded p-1 text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
