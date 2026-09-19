"use client";

import {
  LayoutTemplate,
  LayoutGrid,
  Image,
  BarChart3,
  MessageSquare,
  MousePointerClick,
  HelpCircle,
  CreditCard,
  Code,
  type LucideIcon,
} from "lucide-react";

import { type SectionType } from "@/stores/pageBuilderStore";
import { Button } from "@/components/ui/button";

interface PaletteItem {
  type: SectionType;
  label: string;
  icon: LucideIcon;
  description: string;
}

const paletteItems: PaletteItem[] = [
  {
    type: "hero",
    label: "Hero",
    icon: LayoutTemplate,
    description: "Headline, subtitle, CTA button",
  },
  {
    type: "feature-grid",
    label: "Feature Grid",
    icon: LayoutGrid,
    description: "Icon cards in columns",
  },
  {
    type: "course-carousel",
    label: "Course Carousel",
    icon: Image,
    description: "Horizontal course cards",
  },
  {
    type: "stats-bar",
    label: "Stats Bar",
    icon: BarChart3,
    description: "Number statistics row",
  },
  {
    type: "testimonials",
    label: "Testimonials",
    icon: MessageSquare,
    description: "User review cards",
  },
  {
    type: "cta-banner",
    label: "CTA Banner",
    icon: MousePointerClick,
    description: "Call to action strip",
  },
  {
    type: "faq",
    label: "FAQ",
    icon: HelpCircle,
    description: "Accordion questions",
  },
  {
    type: "pricing-table",
    label: "Pricing Table",
    icon: CreditCard,
    description: "Plan comparison",
  },
  {
    type: "custom-html",
    label: "Custom HTML",
    icon: Code,
    description: "Raw HTML or embed",
  },
];

interface SectionPaletteProps {
  onAdd: (type: SectionType) => void;
}

export function SectionPalette({ onAdd }: SectionPaletteProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Add Section
      </p>
      <div className="grid grid-cols-1 gap-2">
        {paletteItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.type}
              variant="outline"
              className="h-auto justify-start gap-3 px-3 py-2.5"
              onClick={() => onAdd(item.type)}
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 text-left">
                <div className="text-sm font-medium text-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
