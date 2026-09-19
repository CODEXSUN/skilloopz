"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Users, BookOpen, Search } from "lucide-react";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const easing = [0.16, 1, 0.3, 1] as const;

interface TenantRecord {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  maxUsers: number;
  currentUser: number;
  customDomain: string | null;
  createdAt: string;
  userCount: number;
  courseCount: number;
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: "", slug: "", plan: "free", maxUsers: 10 });

  const fetchTenants = useCallback(() => {
    setIsLoading(true);
    fetch("/api/tenants")
      .then((res) => res.ok ? res.json() : { tenants: [] })
      .then((data) => setTenants(data.tenants ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  async function handleCreate() {
    if (!newTenant.name.trim() || !newTenant.slug.trim()) return;

    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTenant),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Failed to create tenant");
        return;
      }

      setNewTenant({ name: "", slug: "", plan: "free", maxUsers: 10 });
      setShowCreate(false);
      fetchTenants();
    } catch {
      alert("Failed to create tenant");
    }
  }

  const filtered = tenants.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q);
  });

  const planColors: Record<string, string> = {
    free: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    pro: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    school: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    enterprise: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading tenants..." />;
  if (error) return <ErrorState message={error} onRetry={fetchTenants} />;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Tenants
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage multi-tenant accounts.
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Tenant
          </Button>
        </div>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">No tenants yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tenant) => (
            <Card key={tenant.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{tenant.name}</p>
                    <p className="text-xs text-muted-foreground">/{tenant.slug}</p>
                  </div>
                  <Badge className={planColors[tenant.plan] ?? "bg-muted text-muted-foreground"}>
                    {tenant.plan}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-[rgba(255,255,255,0.03)] p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-3 w-3 text-primary-400" />
                      <p className="font-heading text-sm font-bold text-foreground">
                        {tenant.userCount}/{tenant.maxUsers}
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Users</p>
                  </div>
                  <div className="rounded-lg bg-[rgba(255,255,255,0.03)] p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <BookOpen className="h-3 w-3 text-purple-400" />
                      <p className="font-heading text-sm font-bold text-foreground">{tenant.courseCount}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Courses</p>
                  </div>
                </div>

                {tenant.customDomain && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Domain: {tenant.customDomain}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Create Tenant</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Name</label>
                <Input
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  placeholder="Acme Corporation"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Slug</label>
                <Input
                  value={newTenant.slug}
                  onChange={(e) => setNewTenant({ ...newTenant, slug: e.target.value.toLowerCase() })}
                  placeholder="acme"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Plan</label>
                <select
                  value={newTenant.plan}
                  onChange={(e) => setNewTenant({ ...newTenant, plan: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="school">School</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Max Users</label>
                <Input
                  type="number"
                  min={1}
                  value={newTenant.maxUsers}
                  onChange={(e) => setNewTenant({ ...newTenant, maxUsers: parseInt(e.target.value) || 10 })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!newTenant.name || !newTenant.slug}>Create</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
