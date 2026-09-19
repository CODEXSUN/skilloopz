import { Metadata } from "next";
import { WorldsContent } from "@/components/worlds/worlds-content";

export const metadata: Metadata = {
  title: "Learning Worlds",
  description: "Explore themed learning worlds and master new concepts.",
};

export default function LearningWorldsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <WorldsContent />
    </div>
  );
}