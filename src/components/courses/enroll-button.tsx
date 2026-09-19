"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EnrollButtonProps {
  courseId: string;
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
  const [isLoading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  async function handleEnroll() {
    setLoading(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) setEnrolled(true);
    } finally {
      setLoading(false);
    }
  }

  if (enrolled) {
    return (
      <Button variant="secondary" disabled>
        Enrolled
      </Button>
    );
  }

  return (
    <Button onClick={handleEnroll} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Enrolling...
        </>
      ) : (
        "Enroll Now"
      )}
    </Button>
  );
}
