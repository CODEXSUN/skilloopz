import Link from "next/link";
import { BookOpen, Lightbulb, Printer, Calendar, Target, Star } from "lucide-react";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ParentHomeLearningPage() {
  const user = await getUser();
  if (!user) return null;

  const children = await prisma.profile.findMany({
    where: { parentId: user.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      xp: true,
      level: true,
      currentStreak: true,
    },
  });

  const childIds = children.map((c) => c.id);

  const weakSkills = await prisma.skillMastery.findMany({
    where: {
      userId: { in: childIds },
      score: { lt: 50 },
    },
    include: {
      skill: true,
      user: { select: { fullName: true } },
    },
    orderBy: { score: "asc" },
    take: 5,
  });

  const recentProgress = await prisma.lessonProgress.findMany({
    where: {
      userId: { in: childIds },
      status: "completed",
    },
    include: {
      lesson: { select: { title: true } },
      user: { select: { fullName: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const suggestions = [
    {
      title: "Practice Weak Areas",
      description: "Focus on skills where your child needs extra help.",
      icon: Target,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      action: "Review weak areas with your child using the mastery dashboard.",
    },
    {
      title: "Maintain Streaks",
      description: "Encourage daily learning to keep streaks alive.",
      icon: Star,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      action: "Set a regular study time each day.",
    },
    {
      title: "Explore New Topics",
      description: "Introduce your child to subjects they haven't tried yet.",
      icon: Lightbulb,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      action: "Browse the course catalog together.",
    },
    {
      title: "Print Practice Materials",
      description: "Download worksheets for offline practice.",
      icon: Printer,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      action: "Use the print button on any lesson page.",
    },
  ];

  const activities = [
    {
      title: "Reading Together",
      description: "Read a book together and discuss the story.",
      ageGroup: "All ages",
      duration: "20-30 min",
    },
    {
      title: "Math Games",
      description: "Play counting, addition, or multiplication games.",
      ageGroup: "6-12",
      duration: "15-20 min",
    },
    {
      title: "Science Experiments",
      description: "Try simple experiments with household items.",
      ageGroup: "8-14",
      duration: "30-45 min",
    },
    {
      title: "Writing Practice",
      description: "Write a short story or journal entry together.",
      ageGroup: "8+",
      duration: "20-30 min",
    },
    {
      title: "Vocabulary Building",
      description: "Learn 5 new words and use them in sentences.",
      ageGroup: "All ages",
      duration: "10-15 min",
    },
    {
      title: "Educational Videos",
      description: "Watch and discuss educational content together.",
      ageGroup: "All ages",
      duration: "15-30 min",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Home Learning
        </h1>
        <p className="mt-1 text-muted-foreground">
          Support your child&apos;s learning at home.
        </p>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">No children linked to your account.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {suggestions.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.title}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.bgColor}`}>
                        <Icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{s.title}</h3>
                        <p className="text-sm text-muted-foreground">{s.description}</p>
                        <p className="mt-2 text-xs text-muted-foreground/80">{s.action}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {weakSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Areas Needing Attention</CardTitle>
                <CardDescription>Skills where your child could use extra practice.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weakSkills.map((record) => (
                    <div key={record.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/5 px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{record.skill.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.user.fullName} &middot; {record.skill.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-red-500"
                              style={{ width: `${record.score}%` }}
                            />
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">{record.score.toFixed(0)}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Progress</CardTitle>
              <CardDescription>Lessons your child has completed recently.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentProgress.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">No recent progress.</p>
              ) : (
                <div className="space-y-2">
                  {recentProgress.map((progress) => (
                    <div key={progress.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/5 px-4 py-2">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{progress.lesson.title}</p>
                          <p className="text-xs text-muted-foreground">{progress.user.fullName}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(progress.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suggested Home Activities</CardTitle>
              <CardDescription>Fun learning activities to do together.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {activities.map((activity) => (
                  <div key={activity.title} className="rounded-lg border border-border/50 bg-muted/5 p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium text-foreground">{activity.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{activity.description}</p>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="outline" className="text-[10px]">{activity.ageGroup}</Badge>
                      <Badge variant="outline" className="text-[10px]">{activity.duration}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/parent">Back to Dashboard</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
