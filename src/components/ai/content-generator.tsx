"use client";

import { useState } from "react";
import { Sparkles, Loader2, Copy, Check, Wand2, FileText, HelpCircle, Lightbulb, BookOpen } from "lucide-react";

interface GeneratedContent {
  [key: string]: unknown;
}

interface ContentGeneratorProps {
  lessonId?: string;
  initialContent?: string;
  onInsert?: (content: GeneratedContent) => void;
}

const GENERATION_TYPES = [
  { id: "quiz", label: "Quiz Questions", icon: HelpCircle, description: "Generate quiz questions from lesson content" },
  { id: "practice", label: "Practice Problems", icon: Wand2, description: "Create practice problems for students" },
  { id: "summary", label: "Summary", icon: FileText, description: "Summarize lesson content" },
  { id: "improvements", label: "Improvements", icon: Lightbulb, description: "Get suggestions to improve content" },
  { id: "lesson", label: "Full Lesson", icon: BookOpen, description: "Generate a complete lesson outline" },
];

export function ContentGenerator({ initialContent = "", onInsert }: ContentGeneratorProps) {
  const [content, setContent] = useState(initialContent);
  const [selectedType, setSelectedType] = useState("quiz");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!content.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          content: content.trim(),
          options: {
            questionCount,
            difficulty,
            questionTypes: selectedType === "quiz" ? ["mcq", "truefalse"] : undefined,
          },
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Failed to generate content. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInsert = () => {
    if (result && onInsert) {
      onInsert(result);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI Content Generator</h3>
      </div>

      {/* Type Selection */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {GENERATION_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors ${
                selectedType === type.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "hover:bg-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Input */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Source Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste lesson content, topic description, or text to generate from..."
          rows={4}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Options */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        {selectedType === "quiz" && (
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Questions
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              {[3, 5, 8, 10, 15, 20].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!content.trim() || loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate {GENERATION_TYPES.find((t) => t.id === selectedType)?.label}
          </>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Generated Content</h4>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-muted"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
              {onInsert && (
                <button
                  onClick={handleInsert}
                  className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90"
                >
                  Insert
                </button>
              )}
            </div>
          </div>
          <pre className="max-h-64 overflow-auto rounded bg-background p-3 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
          {(result.note as string | undefined) && (
            <p className="mt-2 text-xs text-amber-500">{result.note as string}</p>
          )}
        </div>
      )}
    </div>
  );
}
