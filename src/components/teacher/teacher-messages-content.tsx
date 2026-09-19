"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Users, Mail, Loader2, CheckCircle } from "lucide-react";

const easing = [0.16, 1, 0.3, 1] as const;

interface Student {
  id: string;
  fullName: string | null;
  email: string | null;
  courseTitle: string;
}

interface Props {
  students: Student[];
}

export function TeacherMessagesContent({ students }: Props) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleStudent(id: string) {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function selectAll() {
    setSelectedStudents(students.map((s) => s.id));
  }

  function clearSelection() {
    setSelectedStudents([]);
  }

  async function handleSend() {
    if (selectedStudents.length === 0) {
      setError("Select at least one student");
      return;
    }
    if (!subject.trim()) {
      setError("Enter a subject");
      return;
    }
    if (!content.trim()) {
      setError("Enter a message");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const promises = selectedStudents.map((recipientId) =>
        fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId, subject, content }),
        }),
      );

      const results = await Promise.all(promises);
      const failed = results.filter((r) => !r.ok);

      if (failed.length > 0) {
        setError(`Failed to send to ${failed.length} student(s)`);
      } else {
        setSent(true);
        setSubject("");
        setContent("");
        setSelectedStudents([]);
      }
    } catch {
      setError("Failed to send messages");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-3xl space-y-8 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easing }}
          className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center"
        >
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
          <h2 className="mt-4 font-heading text-xl font-bold text-foreground">Messages Sent!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your message has been delivered to {selectedStudents.length || "the selected"} student(s).
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
          >
            Send Another Message
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Message Students
        </h1>
        <p className="mt-1 text-muted-foreground">Send messages to your enrolled students.</p>
      </motion.div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: easing }}
      >
        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
              <Users className="h-5 w-5" />
              Select Students ({selectedStudents.length}/{students.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-xs text-primary-400 hover:text-primary-300"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
          </div>

          {students.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No enrolled students found
            </p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {students.map((student) => (
                <label
                  key={student.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                    selectedStudents.includes(student.id)
                      ? "border-primary-500/30 bg-primary-500/10"
                      : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => toggleStudent(student.id)}
                    className="h-4 w-4 rounded border-muted-foreground bg-transparent text-primary-500 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {student.fullName ?? student.email ?? "Student"}
                    </p>
                    <p className="text-xs text-muted-foreground">{student.courseTitle}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: easing }}
      >
        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 shadow-xl space-y-4">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
            <Mail className="h-5 w-5" />
            Message
          </h2>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject..."
              className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary-500/30 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your message..."
              rows={6}
              className="w-full resize-none rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary-500/30 focus:outline-none"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending || selectedStudents.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send to {selectedStudents.length} student{selectedStudents.length !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
