"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeroEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function HeroEditor({ content, onChange }: HeroEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hero-title">Title</Label>
        <Input
          id="hero-title"
          value={(content.title as string) ?? ""}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          placeholder="Learn Anything, Anywhere"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hero-subtitle">Subtitle</Label>
        <Textarea
          id="hero-subtitle"
          value={(content.subtitle as string) ?? ""}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          placeholder="Interactive courses for every age."
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hero-cta-text">CTA Text</Label>
          <Input
            id="hero-cta-text"
            value={(content.ctaText as string) ?? ""}
            onChange={(e) => onChange({ ...content, ctaText: e.target.value })}
            placeholder="Get Started"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero-cta-link">CTA Link</Label>
          <Input
            id="hero-cta-link"
            value={(content.ctaLink as string) ?? ""}
            onChange={(e) => onChange({ ...content, ctaLink: e.target.value })}
            placeholder="/signup"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hero-secondary-cta-text">Secondary CTA Text</Label>
          <Input
            id="hero-secondary-cta-text"
            value={(content.secondaryCtaText as string) ?? ""}
            onChange={(e) => onChange({ ...content, secondaryCtaText: e.target.value })}
            placeholder="Explore Courses"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero-secondary-cta-link">Secondary CTA Link</Label>
          <Input
            id="hero-secondary-cta-link"
            value={(content.secondaryCtaLink as string) ?? ""}
            onChange={(e) => onChange({ ...content, secondaryCtaLink: e.target.value })}
            placeholder="/courses"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Background</Label>
        <Select
          value={(content.background as string) ?? "color"}
          onValueChange={(v) => onChange({ ...content, background: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="color">Solid Color</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="gradient">Gradient</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {(content.background as string) === "image" && (
        <div className="space-y-2">
          <Label htmlFor="hero-bg-image">Background Image URL</Label>
          <Input
            id="hero-bg-image"
            value={(content.bgImage as string) ?? ""}
            onChange={(e) => onChange({ ...content, bgImage: e.target.value })}
            placeholder="https://..."
          />
        </div>
      )}
    </div>
  );
}
