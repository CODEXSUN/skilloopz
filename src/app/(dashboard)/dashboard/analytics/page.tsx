import { AnalyticsContent } from "@/components/dashboard/analytics-content";

export default function StudentAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Track your learning progress, XP trends, and study patterns.
        </p>
      </div>
      <AnalyticsContent />
    </div>
  );
}
