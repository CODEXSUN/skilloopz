export interface Preset {
  id: string;
  name: string;
  description: string;
  type: string;
  schema: {
    content: Record<string, unknown>;
    styles?: Record<string, unknown>;
  };
}

export const HERO_PRESETS: Preset[] = [
  {
    id: "hero-classic",
    name: "Classic",
    description: "Centered text with CTA button",
    type: "hero",
    schema: {
      content: {
        title: "Learn Anything. Anywhere.",
        subtitle: "Adaptive courses designed for every learning style.",
        ctaText: "Start Learning",
        secondaryCtaText: "Explore Courses",
      },
    },
  },
  {
    id: "hero-split",
    name: "Split Layout",
    description: "Text left, visual right",
    type: "hero",
    schema: {
      content: {
        title: "Learn Anything. Built for the Future.",
        subtitle: "Learning should adapt to humans. Not the other way around.",
        ctaText: "Get Started Free",
        secondaryCtaText: "How It Works",
      },
    },
  },
  {
    id: "hero-minimal",
    name: "Minimal",
    description: "Clean, simple, typography-focused",
    type: "hero",
    schema: {
      content: {
        title: "NEOT",
        subtitle: "Adaptive learning platform for the modern world.",
        ctaText: "Join Waitlist",
        secondaryCtaText: "Learn More",
      },
    },
  },
];

export const FEATURE_GRID_PRESETS: Preset[] = [
  {
    id: "features-3col",
    name: "3 Column Grid",
    description: "Three equal feature cards",
    type: "feature-grid",
    schema: {
      content: {
        columns: 3,
        cards: [
          { icon: "brain", title: "Adaptive Learning", description: "Content adjusts to your pace" },
          { icon: "rocket", title: "Fast Progress", description: "Track your growth in real-time" },
          { icon: "star", title: "Expert Content", description: "Curated by industry professionals" },
        ],
      },
    },
  },
  {
    id: "features-4col",
    name: "4 Column Grid",
    description: "Four feature cards",
    type: "feature-grid",
    schema: {
      content: {
        columns: 4,
        cards: [
          { icon: "brain", title: "Adaptive", description: "Smart content that adapts to you" },
          { icon: "rocket", title: "Fast", description: "Learn at your own speed" },
          { icon: "star", title: "Premium", description: "Top-quality courses" },
          { icon: "globe", title: "Global", description: "Learn from anywhere" },
        ],
      },
    },
  },
];

export const CTA_PRESETS: Preset[] = [
  {
    id: "cta-simple",
    name: "Simple",
    description: "Minimal CTA with button",
    type: "cta-banner",
    schema: {
      content: {
        text: "Ready to get started?",
        buttonText: "Get Started Free",
        buttonLink: "/signup",
      },
    },
  },
  {
    id: "cta-feature",
    name: "Feature Rich",
    description: "CTA with subtitle and features",
    type: "cta-banner",
    schema: {
      content: {
        text: "Join 10,000+ learners already growing with NEOT",
        buttonText: "Start Your Journey",
        buttonLink: "/signup",
      },
    },
  },
];

const STORAGE_KEY = "neot_user_presets";

export function getUserPresets(): Preset[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveUserPreset(preset: Preset): void {
  if (typeof window === "undefined") return;
  const existing = getUserPresets().filter((p) => p.id !== preset.id);
  existing.push(preset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function deleteUserPreset(id: string): void {
  if (typeof window === "undefined") return;
  const existing = getUserPresets().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getPresets(type: string): Preset[] {
  const builtIn: Preset[] = (() => {
    switch (type) {
      case "hero":
        return HERO_PRESETS;
      case "feature-grid":
        return FEATURE_GRID_PRESETS;
      case "cta-banner":
        return CTA_PRESETS;
      default:
        return [];
    }
  })();
  const userPresets = getUserPresets().filter((p) => p.type === type);
  return [...builtIn, ...userPresets];
}
