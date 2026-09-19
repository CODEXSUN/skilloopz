"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, User, Clock, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";

const easing = [0.16, 1, 0.3, 1] as const;

interface Message {
  id: string;
  subject: string;
  content: string;
  readAt: string | null;
  createdAt: string;
  sender: { fullName: string | null; role: string };
}

interface Props {
  messages: Message[];
}

export function StudentInboxContent({ messages }: Props) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);

  async function openMessage(msg: Message) {
    setSelectedMessage(msg);
    if (!msg.readAt) {
      setLoading(true);
      try {
        await fetch(`/api/messages/${msg.id}/read`, { method: "PATCH" });
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
  }

  function backToList() {
    setSelectedMessage(null);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Inbox
        </h1>
        <p className="mt-1 text-muted-foreground">Messages from your teachers.</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {selectedMessage ? (
          <motion.div
            key="message"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: easing }}
            className="space-y-4"
          >
            <button
              onClick={backToList}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to inbox
            </button>

            <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 shadow-xl">
              <h2 className="font-heading text-xl font-bold text-foreground">
                {selectedMessage.subject}
              </h2>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {selectedMessage.sender.fullName ?? "Teacher"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(selectedMessage.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="mt-4 whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                {selectedMessage.content}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: easing }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Mail className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">No messages yet</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Messages from your teachers will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg, i) => (
                  <motion.button
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05, ease: easing }}
                    onClick={() => openMessage(msg)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      msg.readAt
                        ? "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.12)]"
                        : "border-primary-500/20 bg-primary-500/5 hover:border-primary-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {!msg.readAt && (
                            <span className="h-2 w-2 rounded-full bg-primary-400" />
                          )}
                          <p className={`font-medium ${msg.readAt ? "text-foreground" : "text-foreground font-semibold"}`}>
                            {msg.subject}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          From: {msg.sender.fullName ?? "Teacher"} •{" "}
                          {new Date(msg.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-primary-400" />
        </div>
      )}
    </div>
  );
}
