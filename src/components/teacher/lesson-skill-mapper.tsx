"use client";

import { useState, useEffect, useCallback } from "react";

interface Skill {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  color: string | null;
  weight: number;
}

interface LessonSkillsResponse {
  mapped: Skill[];
  available: Skill[];
}

interface LessonSkillMapperProps {
  lessonId: string;
}

export function LessonSkillMapper({ lessonId }: LessonSkillMapperProps) {
  const [data, setData] = useState<LessonSkillsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [weight, setWeight] = useState(1.0);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState(1.0);

  const fetchData = useCallback(() => {
    fetch(`/api/lessons/${lessonId}/skills`)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lessonId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!selectedSkill) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: selectedSkill, weight }),
      });
      if (res.ok) {
        setSelectedSkill("");
        setWeight(1.0);
        setShowAdd(false);
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (skillId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/skills`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId, weight: editWeight }),
      });
      if (res.ok) {
        setEditingSkill(null);
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (skillId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/skills?skillId=${skillId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const groupedAvailable = data?.available.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {}) ?? {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Skill Mapping</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {showAdd ? "Cancel" : "+ Add Skill"}
        </button>
      </div>

      {showAdd && (
        <div className="rounded-lg border p-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Skill</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a skill...</option>
              {Object.entries(groupedAvailable).map(([category, skills]) => (
                <optgroup key={category} label={category}>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.icon} {skill.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Weight: {weight.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>Low (0.1)</span>
              <span>Normal (1.0)</span>
              <span>High (2.0)</span>
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!selectedSkill || saving}
            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add Skill"}
          </button>
        </div>
      )}

      {data?.mapped.length === 0 && !showAdd && (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No skills mapped to this lesson yet. Add skills to enable mastery tracking.
        </div>
      )}

      <div className="space-y-2">
        {data?.mapped.map((skill) => (
          <div
            key={skill.id}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
              style={{ backgroundColor: `${skill.color ?? "#3b82f6"}20` }}
            >
              {skill.icon ?? "🎯"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{skill.name}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {skill.category}
              </div>
            </div>

            {editingSkill === skill.id ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={editWeight}
                  onChange={(e) => setEditWeight(parseFloat(e.target.value))}
                  className="w-16 rounded border bg-background px-2 py-1 text-sm text-center"
                />
                <button
                  onClick={() => handleUpdate(skill.id)}
                  disabled={saving}
                  className="rounded bg-emerald-500 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingSkill(null)}
                  className="rounded bg-muted px-2 py-1 text-xs font-medium hover:bg-muted/80"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {skill.weight.toFixed(1)}x
                </span>
                <button
                  onClick={() => {
                    setEditingSkill(skill.id);
                    setEditWeight(skill.weight);
                  }}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <button
                  onClick={() => handleRemove(skill.id)}
                  disabled={saving}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-red-500 disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
