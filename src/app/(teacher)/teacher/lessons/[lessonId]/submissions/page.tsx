"use client";

import { useState } from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Send, CheckCircle2, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";

interface Submission {
  id: string;
  content: string;
  fileUrl: string | null;
  status: string;
  score: number | null;
  feedback: string | null;
  gradedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string | null;
    email: string | null;
    avatarUrl: string | null;
  };
}

export default function SubmissionsPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = use(params);
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["submissions", lessonId],
    queryFn: async () => {
      const res = await fetch(`/api/lessons/${lessonId}/assignments`);
      if (!res.ok) throw new Error("Failed to load submissions");
      return res.json() as Promise<{ submissions: Submission[] }>;
    },
  });

  const gradeMutation = useMutation({
    mutationFn: async ({ submissionId, score, feedback }: { submissionId: string; score: number; feedback: string }) => {
      const res = await fetch(`/api/assignments/${submissionId}/grade`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, feedback }),
      });
      if (!res.ok) throw new Error("Failed to grade submission");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", lessonId] });
    },
  });

  function handleGrade(submissionId: string) {
    const score = parseFloat(scores[submissionId]);
    if (isNaN(score) || score < 0) return;
    gradeMutation.mutate({
      submissionId,
      score,
      feedback: feedbacks[submissionId] ?? "",
    });
  }

  if (isLoading) return <LoadingScreen message="Loading submissions..." />;
  if (error) return <ErrorState message={error.message} />;

  const submissions = data?.submissions ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/teacher"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Submissions</h1>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No submissions yet for this lesson.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const isExpanded = expandedId === sub.id;
            const isGraded = sub.status === "graded";
            const content = (() => {
              try {
                const parsed = JSON.parse(sub.content);
                return parsed.text ?? sub.content;
              } catch {
                return sub.content;
              }
            })();

            return (
              <Card key={sub.id} className={isGraded ? "border-l-4 border-l-emerald-500/50" : "border-l-4 border-l-amber-500/50"}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                        {(sub.user.fullName ?? sub.user.email ?? "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {sub.user.fullName ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sub.createdAt).toLocaleDateString()} at{" "}
                          {new Date(sub.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isGraded ? (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {sub.score}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                        className="text-xs"
                      >
                        {isExpanded ? "Collapse" : "Review"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4 pt-0">
                    <div className="rounded-lg bg-muted/20 border border-border/50 p-4">
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">Student Response</h4>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{content}</p>
                      {sub.fileUrl && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-400 hover:underline"
                          >
                            📎 View attached file
                          </a>
                        </div>
                      )}
                    </div>

                    {!isGraded && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`score-${sub.id}`}>Score</Label>
                            <Input
                              id={`score-${sub.id}`}
                              type="number"
                              min="0"
                              max="1000"
                              value={scores[sub.id] ?? ""}
                              onChange={(e) => setScores((p) => ({ ...p, [sub.id]: e.target.value }))}
                              placeholder="0-100"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`feedback-${sub.id}`}>Feedback</Label>
                          <Textarea
                            id={`feedback-${sub.id}`}
                            value={feedbacks[sub.id] ?? ""}
                            onChange={(e) => setFeedbacks((p) => ({ ...p, [sub.id]: e.target.value }))}
                            placeholder="Provide feedback to the student..."
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleGrade(sub.id)}
                            disabled={gradeMutation.isPending || !scores[sub.id]}
                          >
                            {gradeMutation.isPending ? (
                              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                            ) : (
                              <><Send className="h-4 w-4 mr-2" /> Submit Grade</>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {isGraded && sub.feedback && (
                      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3">
                        <h4 className="text-sm font-semibold text-blue-400 mb-1">Your Feedback</h4>
                        <p className="text-sm text-blue-300 whitespace-pre-wrap">{sub.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
