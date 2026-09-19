import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/public-layout";
import { ProgramDetailPage } from "@/components/programs/program-detail-page";
import { getMarketingProgram, marketingPrograms } from "@/lib/programs/catalog";

interface ProgramPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return marketingPrograms.map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({
  params,
}: ProgramPageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = getMarketingProgram(slug);
  if (!program) return {};
  return {
    title: `${program.title} | skilloopz`,
    description: program.description,
  };
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { slug } = await params;
  const program = getMarketingProgram(slug);
  if (!program) notFound();

  const relatedPrograms = marketingPrograms
    .filter((candidate) => candidate.slug !== program.slug)
    .sort(
      (left, right) =>
        Number(right.category === program.category) -
        Number(left.category === program.category),
    )
    .slice(0, 3);

  return (
    <PublicLayout>
      <ProgramDetailPage program={program} relatedPrograms={relatedPrograms} />
    </PublicLayout>
  );
}
