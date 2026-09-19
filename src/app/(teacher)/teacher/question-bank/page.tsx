"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, Trash2, BookOpen, Tag, Eye } from "lucide-react";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { QuizAutoGenerate } from "@/components/ai/quiz-auto-generate";

const easing = [0.16, 1, 0.3, 1] as const;

interface QuestionRecord {
  id: string;
  subject: string;
  topic: string;
  question: string;
  type: string;
  options: string;
  answer: string;
  explanation: string | null;
  hint: string | null;
  difficulty: string;
  tags: string;
  isPublic: boolean;
  createdAt: string;
}

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchQuestions = useCallback(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("topic", search);
    if (subjectFilter) params.set("subject", subjectFilter);
    if (difficultyFilter) params.set("difficulty", difficultyFilter);
    params.set("page", page.toString());

    fetch(`/api/question-bank?${params}`)
      .then((res) => res.ok ? res.json() : { questions: [], totalPages: 1 })
      .then((data) => {
        setQuestions(data.questions ?? []);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [search, subjectFilter, difficultyFilter, page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this question?")) return;

    try {
      const res = await fetch(`/api/question-bank?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Failed to delete");
        return;
      }
      fetchQuestions();
    } catch {
      alert("Failed to delete question");
    }
  }

  const difficultyColors: Record<string, string> = {
    easy: "bg-green-500/20 text-green-400 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    hard: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const typeLabels: Record<string, string> = {
    mcq: "Multiple Choice",
    "true-false": "True/False",
    "fill-blank": "Fill in Blank",
    "short-answer": "Short Answer",
    matching: "Matching",
    msq: "Multi-Select",
  };

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading questions..." />;
  if (error) return <ErrorState message={error} onRetry={fetchQuestions} />;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Question Bank
            </h1>
            <p className="mt-1 text-muted-foreground">
              Browse, create, and manage reusable quiz questions.
            </p>
          </div>
          <div className="flex gap-2">
            <QuizAutoGenerate
              onInsert={async (newQuestions) => {
                for (const q of newQuestions) {
                  await fetch("/api/question-bank", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      subject: "General",
                      topic: "AI Generated",
                      question: q.text,
                      type: q.type,
                      options: q.options?.map((o) => o.text) ?? [],
                      answer: q.correctAnswer,
                      explanation: q.explanation,
                      hint: q.hint,
                      difficulty: q.difficulty,
                    }),
                  });
                }
                fetchQuestions();
              }}
            />
            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={subjectFilter}
            onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">All Subjects</option>
            <option value="Math">Math</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="History">History</option>
            <option value="General">General</option>
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => { setDifficultyFilter(e.target.value); setPage(1); }}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">No questions found.</p>
            <p className="mt-1 text-sm text-muted-foreground/60">
              Add questions manually or generate them with AI.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const tags = JSON.parse(q.tags) as string[];
            const options = JSON.parse(q.options) as string[];
            return (
              <Card key={q.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={difficultyColors[q.difficulty] ?? "bg-muted text-muted-foreground"}>
                          {q.difficulty}
                        </Badge>
                        <Badge variant="outline">{typeLabels[q.type] ?? q.type}</Badge>
                        <span className="text-xs text-muted-foreground">{q.subject}</span>
                      </div>
                      <p className="mt-2 font-medium text-foreground">{q.question}</p>
                      {options.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          {options.map((opt, i) => (
                            <div key={i} className="text-muted-foreground">
                              {String.fromCharCode(65 + i)}. {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-sm text-green-400">
                        Answer: {q.answer}
                      </p>
                      {q.explanation && (
                        <p className="mt-1 text-xs text-muted-foreground">{q.explanation}</p>
                      )}
                      {tags.length > 0 && (
                        <div className="mt-2 flex gap-1 flex-wrap">
                          {tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px] gap-1">
                              <Tag className="h-2 w-2" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(q.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
