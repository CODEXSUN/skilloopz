"use client";

import { useState, useEffect } from "react";
import { Puzzle, Loader2, Download, Trash2, ExternalLink, Star, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";

interface MarketplaceApp {
  id: string;
  name: string;
  description: string;
  developer: string;
  developerUrl: string | null;
  iconUrl: string | null;
  category: string;
  tags: string;
  version: string;
  installCount: number;
  rating: number;
  ratingCount: number;
}

interface Installation {
  id: string;
  appId: string;
  app: { name: string; description: string; iconUrl: string | null; category: string };
  status: string;
  createdAt: string;
}

const CATEGORIES = ["all", "general", "analytics", "communication", "content", "gamification", "assessment", "admin"];

export default function AppsPage() {
  const [apps, setApps] = useState<MarketplaceApp[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"browse" | "installed">("browse");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    try {
      const [appsRes, installsRes] = await Promise.all([
        fetch("/api/marketplace-apps"),
        fetch("/api/marketplace-apps/installations"),
      ]);
      if (!appsRes.ok) throw new Error("Failed to load apps");
      setApps(await appsRes.json());
      if (installsRes.ok) setInstallations(await installsRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleInstall(appId: string) {
    setMessage(null);
    try {
      const res = await fetch("/api/marketplace-apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Install failed");
      }
      setMessage("App installed successfully");
      await fetchData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Install failed");
    }
  }

  async function handleUninstall(appId: string) {
    setMessage(null);
    try {
      const res = await fetch("/api/marketplace-apps", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Uninstall failed");
      }
      setMessage("App uninstalled");
      await fetchData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Uninstall failed");
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading apps..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  const installedAppIds = new Set(installations.map((i) => i.appId));
  const filteredApps = category === "all" ? apps : apps.filter((a) => a.category === category);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">App Marketplace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse and install third-party apps to extend NEOT.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant={activeTab === "browse" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("browse")}
        >
          <Puzzle className="mr-1.5 h-4 w-4" />
          Browse Apps
        </Button>
        <Button
          variant={activeTab === "installed" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("installed")}
        >
          <Download className="mr-1.5 h-4 w-4" />
          Installed ({installations.length})
        </Button>
      </div>

      {message && (
        <div className={`rounded-lg border p-3 text-center text-sm ${
          message.includes("failed") || message.includes("Failed")
            ? "border-red-500/20 bg-red-500/5 text-red-400"
            : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
        }`}>
          {message}
        </div>
      )}

      {activeTab === "browse" && (
        <>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                variant={category === c ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(c)}
                className="capitalize"
              >
                {c}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredApps.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Puzzle className="mb-4 h-12 w-12 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No apps in this category yet.</p>
                </CardContent>
              </Card>
            ) : (
              filteredApps.map((app) => (
                <Card key={app.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      {app.iconUrl ? (
                        <img src={app.iconUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-xl font-bold text-muted-foreground">
                          {app.name[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base truncate">{app.name}</CardTitle>
                          {app.developerUrl && (
                            <a href={app.developerUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                            </a>
                          )}
                        </div>
                        <CardDescription>{app.developer}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{app.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {app.rating > 0 ? app.rating.toFixed(1) : "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" /> {app.installCount}
                        </span>
                      </div>
                      <Badge variant="secondary" className="capitalize">{app.category}</Badge>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={installedAppIds.has(app.id)}
                      onClick={() => handleInstall(app.id)}
                    >
                      {installedAppIds.has(app.id) ? (
                        <>
                          <Check className="mr-1.5 h-3.5 w-3.5" />
                          Installed
                        </>
                      ) : (
                        <>
                          <Download className="mr-1.5 h-3.5 w-3.5" />
                          Install
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === "installed" && (
        <div className="space-y-3">
          {installations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Download className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No apps installed yet.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveTab("browse")}>
                  Browse Apps
                </Button>
              </CardContent>
            </Card>
          ) : (
            installations.map((inst) => (
              <Card key={inst.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {inst.app.iconUrl ? (
                      <img src={inst.app.iconUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg font-bold text-muted-foreground">
                        {inst.app.name[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{inst.app.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{inst.app.category}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleUninstall(inst.appId)}>
                    <Trash2 className="mr-1.5 h-3.5 w-3.5 text-red-400" />
                    Uninstall
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
