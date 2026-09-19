"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Send, Loader2 } from "lucide-react";

const easing = [0.16, 1, 0.3, 1] as const;

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { fullName: string | null };
}

interface Props {
  courseId: string;
  enrolled: boolean;
}

export function CourseReviews({ courseId, enrolled }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/reviews?courseId=${courseId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setReviews(data.reviews);
          setAvgRating(data.avgRating);
          setTotalCount(data.totalCount);
        }
      })
      .catch(() => {});
  }, [courseId]);

  async function handleSubmit() {
    if (rating === 0) {
      setError("Select a rating");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, rating, comment }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Failed to submit review");
        return;
      }

      setSubmitted(true);
      fetch(`/api/reviews?courseId=${courseId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setReviews(data.reviews);
            setAvgRating(data.avgRating);
            setTotalCount(data.totalCount);
          }
        });
    } catch {
      setError("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${star <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-foreground">{avgRating.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">({totalCount} reviews)</span>
      </div>

      {enrolled && !submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 space-y-3"
        >
          <p className="text-sm font-medium text-foreground">Write a review</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-0.5"
              >
                <Star
                  className={`h-6 w-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)..."
            rows={2}
            maxLength={500}
            className="w-full resize-none rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary-500/30 focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{comment.length}/500</p>
            <button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              Submit
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </motion.div>
      )}

      {submitted && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-sm text-emerald-400">
          Thank you for your review!
        </div>
      )}

      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10 text-xs font-medium text-primary-400">
                    {(review.user.fullName ?? "A").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-foreground">{review.user.fullName ?? "Anonymous"}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
