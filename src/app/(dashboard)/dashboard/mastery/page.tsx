import { MasteryContent } from "@/components/dashboard/mastery-content";

export default function MasteryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Skill Mastery</h1>
        <p className="text-muted-foreground">Track your progress across different skill areas</p>
      </div>
      <MasteryContent />
    </div>
  );
}
