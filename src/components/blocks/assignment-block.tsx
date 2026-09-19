"use client";

import { useState, useEffect } from "react";
import { Loader2, Send, FileUp, CheckCircle2, Clock, Award, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AssignmentContent {
  title?: string;
  instructions?: string;
  maxScore?: number;
  allowFileUpload?: boolean;
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
  dueDate?: string;
}

interface AssignmentBlockProps {
  content: AssignmentContent;
  lessonId?: string;
  blockId?: string;
}

interface Submission {
  id: string;
  content: string;
  fileUrl: string | null;
  status: string;
  score: number | null;
  feedback: string | null;
  gradedAt: string | null;
  createdAt: string;
}

export function AssignmentBlock({ content, lessonId, blockId }: AssignmentBlockProps) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = content.title ?? "Assignment";
  const instructions = content.instructions ?? "Complete the assignment below and submit your work.";
  const maxScore = content.maxScore ?? 100;
  const allowFileUpload = content.allowFileUpload ?? true;
  const maxFileSizeMB = content.maxFileSizeMB ?? 10;

  useEffect(() => {
    if (!lessonId || !blockId) return;
    fetch(`/api/lessons/${lessonId}/assignments/${blockId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.submission) {
          setSubmission(data.submission);
          setTextContent(data.submission.content ?? "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lessonId, blockId]);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      let fileUrl: string | null = null;
      if (file && allowFileUpload) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("lessonId", lessonId ?? "");
        formData.append("blockId", blockId ?? "");
        const uploadRes = await fetch("/api/assignments/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("File upload failed");
        const uploadData = await uploadRes.json();
        fileUrl = uploadData.url;
        setUploading(false);
      }

      const res = await fetch(`/api/lessons/${lessonId}/assignments/${blockId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textContent, fileUrl }),
      });
      if (!res.ok) throw new Error("Failed to submit assignment");
      const data = await res.json();
      setSubmission(data.submission);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isSubmitted = submission && submission.status !== "draft";
  const isGraded = submission && submission.status === "graded";

  return (
    <Card className="border-l-4 border-l-primary-500/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-400" />
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <CardDescription className="mt-2 whitespace-pre-wrap">{instructions}</CardDescription>
          </div>
          {isGraded && (
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25">
              <Award className="h-3 w-3 mr-1" />
              {submission.score}/{maxScore}
            </Badge>
          )}
          {isSubmitted && !isGraded && (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Submitted
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {isGraded && submission.feedback && (
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3">
            <h4 className="text-sm font-semibold text-blue-400 mb-1">Teacher Feedback</h4>
            <p className="text-sm text-blue-300 whitespace-pre-wrap">{submission.feedback}</p>
          </div>
        )}

        {isSubmitted && !isGraded && (
          <div className="rounded-lg bg-muted/20 border border-border/50 px-4 py-3 text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">Your submission has been received. Waiting for teacher review.</p>
          </div>
        )}

        {!isSubmitted && (
          <>
            <div className="space-y-2">
              <Label htmlFor={`assignment-text-${blockId}`}>Your Response</Label>
              <Textarea
                id={`assignment-text-${blockId}`}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Write your response here..."
                rows={6}
                className="min-h-[120px]"
              />
            </div>

            {allowFileUpload && (
              <div className="space-y-2">
                <Label htmlFor={`assignment-file-${blockId}`}>
                  <FileUp className="h-3.5 w-3.5 inline mr-1" />
                  Attach File (max {maxFileSizeMB}MB)
                </Label>
                <Input
                  id={`assignment-file-${blockId}`}
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="text-sm"
                />
                {file && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={submitting || uploading || !textContent.trim()}>
                {submitting || uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {uploading ? "Uploading..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Assignment
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
