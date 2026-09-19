"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Eye, EyeOff, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const easing = [0.16, 1, 0.3, 1] as const;

export function AccountSettings() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteForm, setShowDeleteForm] = useState(false);

  async function handleDelete() {
    if (confirmText !== "DELETE") {
      setError('Type "DELETE" to confirm');
      return;
    }

    setDeleting(true);
    setError(null);

    const res = await fetch("/api/auth/delete-account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirmDelete: true }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to delete account");
      setDeleting(false);
      return;
    }

    router.push("/");
  }

  return (
    <div className="space-y-5">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
        className="space-y-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
            <Download className="h-5 w-5 text-amber-400" />
          </div>
          <h2 className="font-heading text-lg font-bold text-foreground">Export Data</h2>
        </div>

        <p className="text-sm text-muted-foreground">
          Download a copy of your personal data, including profile information, course progress, achievements, and notes.
        </p>

        <Button variant="outline" size="sm" onClick={() => window.alert("Data export coming soon")}>
          <Download className="mr-2 h-4 w-4" />
          Export my data
        </Button>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05, ease: easing }}
        className="space-y-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <h2 className="font-heading text-lg font-bold text-red-400">Danger Zone</h2>
        </div>

        {!showDeleteForm ? (
          <div>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => setShowDeleteForm(true)}
            >
              Delete my account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm font-medium text-red-400">This will permanently delete:</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>• Your profile and account</li>
                <li>• All course progress and achievements</li>
                <li>• All bookmarks and notes</li>
                <li>• All notifications</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deletePassword">Confirm password</Label>
              <div className="relative">
                <Input
                  id="deletePassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmText">
                Type <span className="font-mono text-red-400">DELETE</span> to confirm
              </Label>
              <Input
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)]"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-red-500 px-6 text-sm font-semibold text-white transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete account"
                )}
              </button>

              <button
                onClick={() => {
                  setShowDeleteForm(false);
                  setPassword("");
                  setConfirmText("");
                  setError(null);
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        )}
      </motion.section>
    </div>
  );
}
