"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { SectionBuilder } from "@/components/admin/pages/section-builder";
import { usePageBuilderStore, type SectionType } from "@/stores/pageBuilderStore";
import { DevModeToggle } from "@/components/dev-mode/DevModeToggle";
import { ResponsiveBar } from "@/components/dev-mode/ResponsiveBar";
import { HistoryPanel } from "@/components/dev-mode/HistoryPanel";
import { PublishButton } from "@/components/dev-mode/PublishButton";
import { PreviewToggle } from "@/components/dev-mode/preview-toggle";
import { DevModeProvider } from "@/components/dev-mode/DevModeProvider";
import { useDevModeStore } from "@/stores/devModeStore";
import { useAutoSave } from "@/hooks/useAutoSave";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageData {
  id: string;
  title: string;
  slug: string;
  path: string;
  status: string;
  layout: string;
}

export default function EditPagePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setSections, setLoading, sections, isDirty } = usePageBuilderStore();

  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    title: "",
    slug: "",
    path: "",
    status: "draft",
    layout: "default",
  });

  const handleUpdateSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch(`/api/admin/pages/${pageData!.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update settings");
      }
      const updatedPage = await res.json();
      setPageData(updatedPage);
      setShowSettings(false);
      setToast({ message: "Settings updated!", variant: "success" });
      setTimeout(() => setToast(null), 3000);
      
      // If slug changed, update URL without reload
      if (updatedPage.slug !== slug) {
        router.replace(`/admin/pages/${updatedPage.slug}/edit`);
      }
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed to update settings", variant: "error" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      for (const section of sections) {
        const isNew = !section.id.includes("-");
        if (isNew) {
          await fetch(`/api/admin/pages/${pageData!.id}/sections`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              blockType: section.blockType,
              sortOrder: section.sortOrder,
              content: JSON.stringify(section.content),
              settings: JSON.stringify(section.settings),
            }),
          });
        } else {
          await fetch(`/api/admin/pages/${pageData!.id}/sections/${section.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sortOrder: section.sortOrder,
              content: JSON.stringify(section.content),
              settings: JSON.stringify(section.settings),
            }),
          });
        }
      }

      await fetch(`/api/admin/pages/${pageData!.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });

      const res = await fetch(`/api/admin/pages/${pageData!.id}/sections`);
      const serverSections = await res.json();
      setSections(
        serverSections.map((s: { id: string; pageId: string; blockType: string; sortOrder: number; content: string; settings: string }) => ({
          id: s.id,
          pageId: s.pageId,
          blockType: s.blockType as SectionType,
          sortOrder: s.sortOrder,
          content: JSON.parse(s.content),
          settings: JSON.parse(s.settings),
        })),
      );
      useDevModeStore.getState().disable();
      await fetch(`/api/page-versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: pageData!.id, versionTag: "publish" }),
      });

      setPageData((prev) => prev ? { ...prev, status: "published" } : null);
      setSettingsForm((prev) => ({ ...prev, status: "published" }));
      setToast({ message: "Published!", variant: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to publish", err);
      setToast({ message: "Failed to publish", variant: "error" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const pageRes = await fetch(`/api/admin/pages/${slug}`);
        if (!pageRes.ok) throw new Error("Page not found");
        const page: PageData & { sections: { id: string; pageId: string; blockType: string; sortOrder: number; content: string; settings: string }[] } = await pageRes.json();

        setPageData({ id: page.id, title: page.title, slug: page.slug, path: page.path, status: page.status, layout: page.layout });
        setSettingsForm({
          title: page.title,
          slug: page.slug,
          path: page.path,
          status: page.status,
          layout: page.layout,
        });

        const sections = (page.sections ?? []).map((s) => ({
          id: s.id,
          pageId: s.pageId,
          blockType: s.blockType as SectionType,
          sortOrder: s.sortOrder,
          content: JSON.parse(s.content),
          settings: JSON.parse(s.settings),
        }));
        setSections(sections);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load page");
      } finally {
        setIsLoading(false);
      }
    }

    load();

    return () => {
      setSections([]);
    };
  }, [slug, setSections]);

  useAutoSave(pageData?.id ?? "", slug);

  if (isLoading) {
    return <LoadingScreen message="Loading page..." />;
  }

  if (error || !pageData) {
    return (
      <div className="p-6">
        <ErrorState message={error ?? "Page not found"} onRetry={() => router.refresh()} />
      </div>
    );
  }

  return (
    <DevModeProvider pageId={pageData.id} pageSlug={pageData.slug} pageStatus={pageData.status}>
      {toast && (
        <div
          className={`fixed right-4 top-20 z-[100] rounded-lg border px-4 py-3 text-sm font-medium shadow-lg transition-all ${
            toast.variant === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {toast.message}
        </div>
      )}
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        {/* Top Toolbar */}
        <div className="z-50 flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted/50"
              onClick={() => router.push("/admin/pages")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Pages /
              </span>
              <h1 className="text-xs font-semibold text-foreground">
                {pageData.title}
              </h1>
              <span className="ml-2 rounded-full bg-primary-500/10 px-2 py-0.5 text-[10px] font-medium text-primary-400 ring-1 ring-inset ring-primary-500/20">
                {pageData.status}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-1 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
            <ResponsiveBar />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <HistoryPanel />
            </div>
            <div className="h-4 w-[1px] bg-border" />
            <DevModeToggle />
            <PreviewToggle pageId={pageData.id} pageSlug={pageData.slug} />
            <PublishButton
              onPublish={handlePublish}
              isDirty={isDirty}
              pageTitle={pageData.title}
            />
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 overflow-hidden">
          <SectionBuilder pageId={pageData.id} />
        </div>

        {/* Page Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Page Settings</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" required>Title</Label>
                <Input
                  id="title"
                  value={settingsForm.title}
                  onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                  placeholder="Page Title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug" required>Slug</Label>
                <Input
                  id="slug"
                  value={settingsForm.slug}
                  onChange={(e) => setSettingsForm({ ...settingsForm, slug: e.target.value })}
                  placeholder="page-slug"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="path" required>Path</Label>
                <Input
                  id="path"
                  value={settingsForm.path}
                  onChange={(e) => setSettingsForm({ ...settingsForm, path: e.target.value })}
                  placeholder="/page-path"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={settingsForm.status}
                    onValueChange={(v) => setSettingsForm({ ...settingsForm, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Layout</Label>
                  <Select
                    value={settingsForm.layout}
                    onValueChange={(v) => setSettingsForm({ ...settingsForm, layout: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="full_width">Full Width</SelectItem>
                      <SelectItem value="landing">Landing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSettings} disabled={savingSettings}>
                {savingSettings ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DevModeProvider>
  );
}
