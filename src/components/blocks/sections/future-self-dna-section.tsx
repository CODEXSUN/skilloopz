"use client";

import { LearningDnaSection } from "./learning-dna-section";
import { FutureSelfSection } from "./future-self-section";
import { IntelligenceCorridor } from "./intelligence-corridor";

export function FutureSelfDnaSection() {
  return (
    <>
      <LearningDnaSection />
      <IntelligenceCorridor scene="cosmic" variant="default" />
      <FutureSelfSection />
    </>
  );
}
