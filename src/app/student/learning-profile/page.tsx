import { Metadata } from "next";
import { LearningProfileContent } from "@/components/learning/learning-profile-content";

export const metadata: Metadata = {
  title: "Learning Profile",
  description: "Discover your learning style and customize your NEOT experience.",
};

export default function LearningProfilePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <LearningProfileContent />
    </div>
  );
}