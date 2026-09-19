"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface QuizQuestion {
  id: number;
  question: string;
  options: { label: string; style: string; text: string }[];
}

const questions: QuizQuestion[] = [
  {
    id: 1,
    question: "When learning something new, I prefer to:",
    options: [
      { label: "A", style: "visual", text: "Watch a video or see diagrams" },
      { label: "B", style: "auditory", text: "Listen to an explanation or discussion" },
      { label: "C", style: "reading", text: "Read a detailed article or book" },
      { label: "D", style: "kinesthetic", text: "Try it out myself with hands-on practice" },
    ],
  },
  {
    id: 2,
    question: "I remember information best when I:",
    options: [
      { label: "A", style: "visual", text: "See it written down with charts or images" },
      { label: "B", style: "auditory", text: "Hear it explained out loud" },
      { label: "C", style: "reading", text: "Read and re-read the material" },
      { label: "D", style: "kinesthetic", text: "Practice by doing exercises or building something" },
    ],
  },
  {
    id: 3,
    question: "In a classroom or course, I learn most effectively when:",
    options: [
      { label: "A", style: "visual", text: "The instructor uses slides, diagrams, and demonstrations" },
      { label: "B", style: "auditory", text: "There are group discussions and verbal explanations" },
      { label: "C", style: "reading", text: "There are handouts, textbooks, and written notes" },
      { label: "D", style: "kinesthetic", text: "There are hands-on projects and real-world examples" },
    ],
  },
  {
    id: 4,
    question: "When studying for a test, I usually:",
    options: [
      { label: "A", style: "visual", text: "Create mind maps, charts, or color-coded notes" },
      { label: "B", style: "auditory", text: "Record myself or discuss with others" },
      { label: "C", style: "reading", text: "Rewrite and organize my notes" },
      { label: "D", style: "kinesthetic", text: "Take practice tests or build example projects" },
    ],
  },
  {
    id: 5,
    question: "If I get lost in a lesson, I usually:",
    options: [
      { label: "A", style: "visual", text: "Look for a diagram or illustration" },
      { label: "B", style: "auditory", text: "Ask someone to explain it verbally" },
      { label: "C", style: "reading", text: "Reread the instructions carefully" },
      { label: "D", style: "kinesthetic", text: "Keep experimenting until it clicks" },
    ],
  },
];

interface StyleQuizProps {
  onComplete: (styleId: string) => void;
}

export function StyleQuiz({ onComplete }: StyleQuizProps) {
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState(false);

  const handleAnswer = (style: string) => {
    const newScores = { ...scores, [style]: (scores[style] ?? 0) + 1 };
    setScores(newScores);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setCompleted(true);
      const sorted = Object.entries(newScores).sort(([, a], [, b]) => b - a);
      const topStyle = sorted[0][0];
      const styleMap: Record<string, string> = {
        visual: "style-visual",
        auditory: "style-auditory",
        reading: "style-reading",
        kinesthetic: "style-kinesthetic",
      };
      onComplete(styleMap[topStyle] ?? "style-reading");
    }
  };

  if (completed) {
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const resultStyle = sorted[0][0];
    const resultLabels: Record<string, string> = {
      visual: "Visual Learner",
      auditory: "Auditory Learner",
      reading: "Reading Learner",
      kinesthetic: "Kinesthetic Learner",
    };

    return (
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Your Learning Style</CardTitle>
          <CardDescription>Based on your answers</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-2xl font-bold text-foreground">{resultLabels[resultStyle]}</p>
          <div className="mt-4 space-y-2">
            {sorted.map(([style, score]) => (
              <div key={style} className="flex items-center gap-3">
                <span className="w-24 text-left text-sm capitalize text-muted-foreground">{style}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(score / questions.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="w-8 text-right text-sm text-muted-foreground">{score}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const q = questions[current];

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Question {current + 1} of {questions.length}</span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full ${i <= current ? "bg-blue-500" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
        <CardTitle className="mt-4 text-lg">{q.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {q.options.map((opt) => (
              <Button
                key={opt.label}
                variant="outline"
                className="flex w-full justify-start gap-3 h-auto py-3 px-4"
                onClick={() => handleAnswer(opt.style)}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                  {opt.label}
                </span>
                <span className="text-left">{opt.text}</span>
              </Button>
            ))}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}