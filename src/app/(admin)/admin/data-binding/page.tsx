"use client";

import { useState } from "react";
import { Database, Loader2, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DataSourceType } from "@/lib/data-binding";

const dataSourceInfo: Record<DataSourceType, { label: string; description: string }> = {
  courses: { label: "Courses", description: "Fetch courses with optional status filter" },
  users: { label: "Users", description: "Fetch user profiles with optional role filter" },
  categories: { label: "Categories", description: "Fetch all categories" },
  enrollments: { label: "Enrollments", description: "Fetch enrollments with optional userId filter" },
  lessons: { label: "Lessons", description: "Fetch lessons with optional status filter" },
  analytics: { label: "Analytics", description: "Aggregate counts (users, courses, enrollments)" },
};

export default function AdminDataBindingPage() {
  const [sourceType, setSourceType] = useState<DataSourceType>("courses");
  const [filterKey, setFilterKey] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [limit, setLimit] = useState("");
  const [result, setResult] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePreview() {
    setLoading(true);
    setError(null);
    setResult(null);

    const filters: Record<string, unknown> = {};
    if (filterKey && filterValue) {
      filters[filterKey] = filterValue;
    }

    try {
      const res = await fetch("/api/admin/data-binding/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: sourceType,
          filters,
          limit: limit ? parseInt(limit, 10) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(typeof data.error === "string" ? data.error : "Preview failed");
      }

      const data = await res.json();
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to preview data source");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Data Binding</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resolve data source references for block props.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(dataSourceInfo).map(([key, info]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${
              sourceType === key ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSourceType(key as DataSourceType)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">{info.label}</CardTitle>
              </div>
              <CardDescription className="text-xs">{info.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test Data Source</CardTitle>
          <CardDescription>
            Configure filters and preview the resolved data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={sourceType} onValueChange={(v) => setSourceType(v as DataSourceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(dataSourceInfo).map(([key, info]) => (
                    <SelectItem key={key} value={key}>{info.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter Key (optional)</Label>
              <Input
                value={filterKey}
                onChange={(e) => setFilterKey(e.target.value)}
                placeholder="e.g. status"
              />
            </div>

            <div className="space-y-2">
              <Label>Filter Value (optional)</Label>
              <Input
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder="e.g. published"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Limit (optional)</Label>
              <Input
                type="number"
                min={1}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="e.g. 10"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handlePreview} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Preview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {result !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Result ({result.length} items)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-96 overflow-auto rounded-lg bg-muted p-4 text-xs text-muted-foreground">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
