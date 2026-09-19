"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ReviewItem {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  skillName: string;
  masteryScore: number;
  daysSinceLastReview: number;
  nextReviewDate: string;
  urgency: "due" | "overdue" | "upcoming";
  interval: number;
}

interface ReviewSummary {
  total: number;
  overdue: number;
  due: number;
  upcoming: number;
  nextReview: ReviewItem | null;
}

interface ReviewsData {
  reviews: ReviewItem[];
}

export function SpacedRepetitionWidget() {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/gamification/reviews?type=summary").then((r) => r.json()),
      fetch("/api/gamification/reviews?limit=5").then((r) => r.json()),
    ]).then(([summaryData, reviewsData]) => {
      setSummary(summaryData);
      setReviews(reviewsData.reviews ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!summary || summary.total === 0) {
    return null;
  }

  const urgencyColors = {
    overdue: "text-red-400 bg-red-500/10 border-red-500/30",
    due: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    upcoming: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  };

  const urgencyIcons = {
    overdue: AlertCircle,
    due: Clock,
    upcoming: Calendar,
  };

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Review Schedule</h3>
        <div className="flex gap-2 text-xs">
          {summary.overdue > 0 && (
            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-red-400">
              {summary.overdue} overdue
            </span>
          )}
          {summary.due > 0 && (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-400">
              {summary.due} due
            </span>
          )}
          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-400">
            {summary.upcoming} upcoming
          </span>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-2">
        {reviews.map((review) => {
          const Icon = urgencyIcons[review.urgency];
          const colors = urgencyColors[review.urgency];

          return (
            <Link
              key={`${review.lessonId}-${review.skillName}`}
              href={`/courses/${review.courseId}/lessons/${review.lessonId}`}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 ${colors.split(" ")[2]}`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${colors.split(" ")[0]}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-sm">{review.lessonTitle}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${colors}`}>
                    {review.urgency}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {review.skillName} · {review.masteryScore}% mastery · {review.daysSinceLastReview}d ago
                </div>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>

      {summary.total > 5 && (
        <Link
          href="/dashboard/reviews"
          className="flex items-center justify-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all {summary.total} reviews
          <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
