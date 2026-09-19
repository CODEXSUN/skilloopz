"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  step: number;
  data: Record<string, unknown>;
  onUpdate: (partial: Record<string, unknown>) => void;
}

export function TeacherOnboarding({ step, data, onUpdate }: Props) {
  if (step === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">Set up your profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">Students will see this information</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={(data.fullName as string) ?? ""}
              onChange={(e) => onUpdate({ fullName: e.target.value })}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearsExperience">Years of experience</Label>
            <Input
              id="yearsExperience"
              value={(data.yearsExperience as string) ?? ""}
              onChange={(e) => onUpdate({ yearsExperience: e.target.value })}
              placeholder="e.g. 5 years"
            />
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">What do you teach?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Help students find your courses</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subjects">Subjects you teach</Label>
            <Input
              id="subjects"
              value={((data.subjects as string[]) ?? []).join(", ")}
              onChange={(e) =>
                onUpdate({
                  subjects: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="math, science, english"
            />
            <p className="text-xs text-muted-foreground">Comma-separated</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gradeLevels">Grade levels</Label>
            <Input
              id="gradeLevels"
              value={((data.gradeLevels as string[]) ?? []).join(", ")}
              onChange={(e) =>
                onUpdate({
                  gradeLevels: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="elementary, middle, high school"
            />
            <p className="text-xs text-muted-foreground">Comma-separated</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Short bio</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tell students about yourself and your teaching style</p>
      </div>

      <div className="space-y-2">
        <Textarea
          id="bio"
          value={(data.bio as string) ?? ""}
          onChange={(e) => onUpdate({ bio: e.target.value })}
          placeholder="I'm passionate about making learning fun and accessible..."
          rows={5}
          maxLength={500}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {((data.bio as string) ?? "").length}/500 characters
        </p>
      </div>
    </div>
  );
}
