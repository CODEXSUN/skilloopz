import { blockRegistry } from "@/lib/block-registry";
import { editorRegistry } from "@/lib/editor-registry";

// Lesson block renders
import { TextBlock } from "@/components/blocks/text-block";
import { VideoBlock } from "@/components/blocks/video-block";
import { QuizBlock } from "@/components/blocks/quiz-block";
import { PdfBlock } from "@/components/blocks/pdf-block";
import { AssignmentBlock } from "@/components/blocks/assignment-block";

blockRegistry.register("text", { component: TextBlock, label: "Text", scope: "lesson" });
blockRegistry.register("video", { component: VideoBlock, label: "Video", scope: "lesson" });
blockRegistry.register("quiz", { component: QuizBlock, label: "Quiz", scope: "lesson" });
blockRegistry.register("pdf", { component: PdfBlock, label: "PDF", scope: "lesson" });
blockRegistry.register("assignment", { component: AssignmentBlock, label: "Assignment", scope: "lesson" });

// Page section renders
import {
  HeroSection,
  AdaptiveStreamSection,
  FeatureGridSection,
  StatsBarSection,
  HowItWorksSection,
  CtaBannerSection,
  FaqSection,
  PricingTableSection,
  CourseCarouselSection,
  TestimonialsSection,
  CustomHtmlSection,
  KnowledgeConstellationSection,
  AdaptiveTimelineSection,
  LiveEcosystemSection,
  FutureSelfSection,
  AchievementEcosystemSection,
  LearningDnaSection,
} from "@/components/blocks/sections";

blockRegistry.register("hero", { component: HeroSection, label: "Hero", scope: "page" });
blockRegistry.register("adaptive-stream", { component: AdaptiveStreamSection, label: "Adaptive Stream", scope: "page" });
blockRegistry.register("feature-grid", { component: FeatureGridSection, label: "Feature Grid", scope: "page" });
blockRegistry.register("stats-bar", { component: StatsBarSection, label: "Stats Bar", scope: "page" });
blockRegistry.register("how-it-works", { component: HowItWorksSection, label: "How It Works", scope: "page" });
blockRegistry.register("cta-banner", { component: CtaBannerSection, label: "CTA Banner", scope: "page" });
blockRegistry.register("faq", { component: FaqSection, label: "FAQ", scope: "page" });
blockRegistry.register("pricing-table", { component: PricingTableSection, label: "Pricing Table", scope: "page" });
blockRegistry.register("course-carousel", { component: CourseCarouselSection, label: "Course Carousel", scope: "page" });
blockRegistry.register("testimonials", { component: TestimonialsSection, label: "Testimonials", scope: "page" });
blockRegistry.register("custom-html", { component: CustomHtmlSection, label: "Custom HTML", scope: "page" });
blockRegistry.register("knowledge-constellation", { component: KnowledgeConstellationSection, label: "Knowledge Constellation", scope: "page" });
blockRegistry.register("adaptive-timeline", { component: AdaptiveTimelineSection, label: "Adaptive Timeline", scope: "page" });
blockRegistry.register("live-ecosystem", { component: LiveEcosystemSection, label: "Live Ecosystem", scope: "page" });
blockRegistry.register("future-self", { component: FutureSelfSection, label: "Future Self", scope: "page" });
blockRegistry.register("achievement-ecosystem", { component: AchievementEcosystemSection, label: "Achievement Ecosystem", scope: "page" });
blockRegistry.register("learning-dna", { component: LearningDnaSection, label: "Learning DNA", scope: "page" });

// Page section editors
import { HeroEditor } from "@/components/admin/pages/section-editors/hero-editor";
import { FeatureGridEditor } from "@/components/admin/pages/section-editors/feature-grid-editor";
import { StatsBarEditor } from "@/components/admin/pages/section-editors/stats-bar-editor";
import { CtaEditor } from "@/components/admin/pages/section-editors/cta-editor";
import { FaqEditor } from "@/components/admin/pages/section-editors/faq-editor";
import { PricingEditor } from "@/components/admin/pages/section-editors/pricing-editor";
import { TestimonialsEditor } from "@/components/admin/pages/section-editors/testimonials-editor";

editorRegistry.register("hero", HeroEditor);
editorRegistry.register("feature-grid", FeatureGridEditor);
editorRegistry.register("stats-bar", StatsBarEditor);
editorRegistry.register("cta-banner", CtaEditor);
editorRegistry.register("faq", FaqEditor);
editorRegistry.register("pricing-table", PricingEditor);
editorRegistry.register("testimonials", TestimonialsEditor);
