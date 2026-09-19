"use client";

import { motion } from "framer-motion";
import { CourseCard } from "@/components/courses/course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import type { CourseListItem } from "@/hooks/useCourses";

interface CourseGridProps {
  courses?: CourseListItem[];
  isLoading: boolean;
  error: Error | null;
  enrollments?: Map<string, number>;
}

const easing = [0.16, 1, 0.3, 1] as const;

export function CourseGrid({
  courses,
  isLoading,
  error,
  enrollments,
}: CourseGridProps) {
  if (isLoading) return <LoadingScreen fullScreen={false} />;

  if (error) return <ErrorState message={error.message} />;

  if (!courses?.length) {
    return (
      <EmptyState
        title="No courses found"
        description="Check back later for new courses."
      />
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.08, delayChildren: 0.1 },
        },
      }}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {courses.map((course) => (
        <motion.div
          key={course.id}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6, ease: easing }}
        >
          <CourseCard
            course={course}
            enrolled={enrollments?.has(course.id)}
            progress={enrollments?.get(course.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
