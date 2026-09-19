"use client";

import { useState } from "react";
import { useLearningProfile } from "@/lib/learning/learning-style-provider";
import { StyleQuiz } from "@/components/learning/style-quiz";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, RefreshCw } from "lucide-react";

const styleIcons: Record<string, string> = {
  visual: "👁️",
  auditory: "🎧",
  reading: "📖",
  kinesthetic: "🛠️",
};

export function LearningProfileContent() {
  const { profile, loading, detectStyle, updateProfile } = useLearningProfile();
  const [showQuiz, setShowQuiz] = useState(false);
  const [detecting, setDetecting] = useState(false);

  if (loading && !profile) return <LoadingScreen />;

  const handleQuizComplete = async (styleId: string) => {
    await updateProfile({ learningStyleId: styleId, quizCompleted: true } as any);
    setShowQuiz(false);
  };

  const handleDetect = async () => {
    setDetecting(true);
    await detectStyle();
    setDetecting(false);
  };

  if (showQuiz) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Learning Style Quiz</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Answer 5 quick questions to discover your learning style
          </p>
        </div>
        <StyleQuiz onComplete={handleQuizComplete} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Learning Profile</h1>
        <p className="mt-1 text-muted-foreground">
          NEOT adapts to how you learn best. Discover and customize your learning style.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-blue-400" />
            Your Learning Style
          </CardTitle>
          <CardDescription>
            NEOT uses your learning style to recommend the best content format for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.learningStyle ? (
            <div className="flex items-center gap-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
              <span className="text-3xl">
                {styleIcons[profile.learningStyle.name] ?? "📖"}
              </span>
              <div>
                <p className="font-semibold text-foreground">{profile.learningStyle.label}</p>
                {profile.styleOverridden && (
                  <Badge variant="outline" className="mt-1">Manually set</Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[rgba(255,255,255,0.1)] p-6 text-center">
              <p className="text-muted-foreground">No learning style detected yet</p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleDetect} disabled={detecting} variant="outline">
              <RefreshCw className={`mr-2 h-4 w-4 ${detecting ? "animate-spin" : ""}`} />
              {detecting ? "Analyzing..." : "Detect from Activity"}
            </Button>
            <Button onClick={() => setShowQuiz(true)}>
              <Brain className="mr-2 h-4 w-4" />
              Take Style Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Preferred Difficulty</p>
              <p className="text-sm text-muted-foreground">
                {profile?.preferredDifficulty === 1 ? "Beginner" :
                 profile?.preferredDifficulty === 2 ? "Intermediate" :
                 profile?.preferredDifficulty === 3 ? "Advanced" : "Not set"}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Attention Span</p>
              <p className="text-sm text-muted-foreground">
                ~{profile?.attentionSpan ?? 20} minutes
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Quiz Completed</p>
              <p className="text-sm text-muted-foreground">
                {profile?.quizCompleted ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}