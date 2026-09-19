"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Send, Mail, Plus, Search, User, BookOpen, ChevronDown, ChevronUp,
  Clock, ArrowLeft, Reply,
} from "lucide-react";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const easing = [0.16, 1, 0.3, 1] as const;

interface Teacher {
  id: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  subjects: string[];
  courses: { id: string; title: string; subject: string | null }[];
}

interface Message {
  id: string;
  subject: string;
  content: string;
  readAt: string | null;
  createdAt: string;
  sender: {
    id: string;
    fullName: string | null;
    role: string;
  };
}

type View = "inbox" | "compose" | "detail";

export default function ParentMessagesPage() {
  const [view, setView] = useState<View>("inbox");
  const [messages, setMessages] = useState<Message[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/messages").then((res) => res.ok ? res.json() : { messages: [] }),
      fetch("/api/parent/teachers").then((res) => res.ok ? res.json() : { teachers: [] }),
    ])
      .then(([msgData, teacherData]) => {
        setMessages(msgData.messages ?? []);
        setTeachers(teacherData.teachers ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [refreshKey]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

  async function handleSend() {
    if (!selectedTeacher || !subject.trim() || !content.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedTeacher.id,
          subject: subject.trim(),
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Failed to send message");
        return;
      }

      setSubject("");
      setContent("");
      setSelectedTeacher(null);
      setView("inbox");
      handleRefresh();
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setIsSending(false);
    }
  }

  async function handleMarkRead(messageId: string) {
    try {
      await fetch(`/api/messages/${messageId}/read`, { method: "PATCH" });
      handleRefresh();
    } catch {
      // Silent fail
    }
  }

  function handleViewMessage(msg: Message) {
    setSelectedMessage(msg);
    setView("detail");
    if (!msg.readAt) {
      handleMarkRead(msg.id);
    }
  }

  function handleReply(msg: Message) {
    const teacher = teachers.find((t) => t.id === msg.sender.id);
    if (teacher) {
      setSelectedTeacher(teacher);
      setSubject(`Re: ${msg.subject}`);
      setContent(`\n\n--- Original Message ---\n${msg.content}`);
      setView("compose");
    }
  }

  const filteredTeachers = teachers.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.fullName?.toLowerCase().includes(q) ??
      t.email?.toLowerCase().includes(q) ??
      t.subjects.some((s) => s.toLowerCase().includes(q)) ??
      t.courses.some((c) => c.title.toLowerCase().includes(q))
    );
  });

  const unreadCount = messages.filter((m) => !m.readAt).length;

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading messages..." />;
  if (error) return <ErrorState message={error} onRetry={handleRefresh} />;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Messages</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Contact your children&apos;s teachers.
            </p>
          </div>
          {view === "inbox" && (
            <Button onClick={() => setView("compose")} className="gap-2">
              <Plus className="h-4 w-4" />
              New Message
            </Button>
          )}
        </div>
      </motion.div>

      {view === "inbox" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: easing }}
          className="space-y-4"
        >
          {unreadCount > 0 && (
            <Badge variant="default" className="bg-primary-500/20 text-primary-400 border-primary-500/30">
              <Mail className="h-3 w-3 mr-1" />
              {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
            </Badge>
          )}

          {messages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No messages yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Contact your children&apos;s teachers to get started.
                </p>
                <Button onClick={() => setView("compose")} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Compose Message
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border border-border bg-[rgba(255,255,255,0.02)] p-4 cursor-pointer transition-all hover:bg-[rgba(255,255,255,0.04)] ${
                    !msg.readAt ? "border-l-4 border-l-primary" : ""
                  }`}
                  onClick={() => handleViewMessage(msg)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!msg.readAt && (
                          <span className="h-2 w-2 rounded-full bg-primary-400 shrink-0" />
                        )}
                        <p className={`truncate ${!msg.readAt ? "font-semibold text-foreground" : "text-foreground"}`}>
                          {msg.sender.fullName ?? msg.sender.role}
                        </p>
                        <Badge variant="outline" className="text-[10px]">{msg.sender.role}</Badge>
                      </div>
                      <p className={`mt-1 truncate text-sm ${!msg.readAt ? "text-foreground" : "text-muted-foreground"}`}>
                        {msg.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                      <Clock className="h-3 w-3" />
                      {new Date(msg.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {view === "compose" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easing }}
        >
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => setView("inbox")} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h2 className="text-lg font-semibold text-foreground">
              {selectedTeacher ? `Message to ${selectedTeacher.fullName}` : "Select Teacher"}
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Teacher Selection */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Teachers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search teachers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredTeachers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No teachers found.</p>
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className={`rounded-lg border border-border p-3 cursor-pointer transition-all ${
                          selectedTeacher?.id === teacher.id
                            ? "border-primary bg-primary/10"
                            : "hover:bg-[rgba(255,255,255,0.02)]"
                        }`}
                        onClick={() => {
                          setSelectedTeacher(teacher);
                          setExpandedTeacher(
                            expandedTeacher === teacher.id ? null : teacher.id
                          );
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10 text-xs font-bold text-primary-400 shrink-0">
                            {teacher.fullName?.charAt(0)?.toUpperCase() ?? "T"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {teacher.fullName ?? "Unnamed"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{teacher.email}</p>
                          </div>
                          {expandedTeacher === teacher.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        {expandedTeacher === teacher.id && (
                          <div className="mt-3 pt-3 border-t border-border space-y-2">
                            {teacher.subjects.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {teacher.subjects.slice(0, 3).map((s) => (
                                  <Badge key={s} variant="secondary" className="text-[10px]">
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {teacher.courses.map((c) => (
                              <div key={c.id} className="flex items-center gap-1 text-xs text-muted-foreground">
                                <BookOpen className="h-3 w-3" />
                                <span className="truncate">{c.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Compose Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Compose</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">To</label>
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-[rgba(255,255,255,0.02)]">
                    {selectedTeacher ? (
                      <>
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{selectedTeacher.fullName}</span>
                        <Badge variant="outline" className="ml-auto text-[10px]">Teacher</Badge>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Select a teacher from the list</span>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="text-sm font-medium text-foreground mb-1 block">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="Message subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="content" className="text-sm font-medium text-foreground mb-1 block">
                    Message
                  </label>
                  <Textarea
                    id="content"
                    placeholder="Write your message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setView("inbox")}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={!selectedTeacher || !subject.trim() || !content.trim() || isSending}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {view === "detail" && selectedMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easing }}
        >
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => setView("inbox")} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10 text-xs font-bold text-primary-400">
                      {selectedMessage.sender.fullName?.charAt(0)?.toUpperCase() ?? "T"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {selectedMessage.sender.fullName ?? selectedMessage.sender.role}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedMessage.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      {selectedMessage.sender.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <Button onClick={() => handleReply(selectedMessage)} className="gap-2">
                  <Reply className="h-4 w-4" />
                  Reply
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
