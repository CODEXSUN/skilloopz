import { AccessibilityTools } from "@/components/dev-mode/accessibility-tools";

export default function AccessibilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Accessibility</h1>
        <p className="mt-1 text-muted-foreground">
          Audit and improve accessibility across the platform.
        </p>
      </div>
      <AccessibilityTools />
    </div>
  );
}
