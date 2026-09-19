"use client";

import { usePageBuilderStore } from "@/stores/pageBuilderStore";

type AnimationType = "none" | "fade-in" | "slide-up" | "scale" | "rotate";
type Easing = "linear" | "ease-in" | "ease-out" | "ease-in-out";

interface AnimationSettings {
  type: AnimationType;
  duration: number;
  delay: number;
  easing: Easing;
}

interface ScrollAnimationSettings {
  enabled: boolean;
  parallaxSpeed: number;
}

interface StaggerSettings {
  enabled: boolean;
  staggerDelay: number;
}

interface AnimationConfig {
  entrance?: AnimationSettings;
  scroll?: ScrollAnimationSettings;
  stagger?: StaggerSettings;
}

function getAnimation(sectionId: string): AnimationConfig {
  const section = usePageBuilderStore.getState().sections.find((s) => s.id === sectionId);
  if (!section) return {};
  const raw = section.settings?.animation;
  if (raw && typeof raw === "object") return raw as AnimationConfig;
  return {};
}

function setAnimation(sectionId: string, update: Partial<AnimationConfig>) {
  const current = getAnimation(sectionId);
  const merged = { ...current, ...update };
  usePageBuilderStore.getState().updateSection(sectionId, {
    settings: {
      ...usePageBuilderStore.getState().sections.find((s) => s.id === sectionId)?.settings,
      animation: merged,
    },
  });
}

const easingOptions: { value: Easing; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "ease-in", label: "Ease In" },
  { value: "ease-out", label: "Ease Out" },
  { value: "ease-in-out", label: "Ease In Out" },
];

const animationOptions: { value: AnimationType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade-in", label: "Fade In" },
  { value: "slide-up", label: "Slide Up" },
  { value: "scale", label: "Scale" },
  { value: "rotate", label: "Rotate" },
];

interface MotionTabProps {
  sectionId: string;
}

export function MotionTab({ sectionId }: MotionTabProps) {
  const animation = getAnimation(sectionId);
  const entrance = animation.entrance ?? { type: "none", duration: 0.6, delay: 0, easing: "ease-out" };
  const scroll = animation.scroll ?? { enabled: false, parallaxSpeed: 0.3 };
  const stagger = animation.stagger ?? { enabled: false, staggerDelay: 0.1 };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
      <Section title="Entrance Animation">
        <PropertyRow label="Type">
          <select
            value={entrance.type}
            onChange={(e) =>
              setAnimation(sectionId, {
                entrance: { ...entrance, type: e.target.value as AnimationType },
              })
            }
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          >
            {animationOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </PropertyRow>
        {entrance.type !== "none" && (
          <>
            <PropertyRow label="Duration">
              <Slider
                value={entrance.duration}
                min={0.1}
                max={2}
                step={0.1}
                unit="s"
                onChange={(v) =>
                  setAnimation(sectionId, {
                    entrance: { ...entrance, duration: v },
                  })
                }
              />
            </PropertyRow>
            <PropertyRow label="Delay">
              <Slider
                value={entrance.delay}
                min={0}
                max={1}
                step={0.1}
                unit="s"
                onChange={(v) =>
                  setAnimation(sectionId, {
                    entrance: { ...entrance, delay: v },
                  })
                }
              />
            </PropertyRow>
            <PropertyRow label="Easing">
              <select
                value={entrance.easing}
                onChange={(e) =>
                  setAnimation(sectionId, {
                    entrance: { ...entrance, easing: e.target.value as Easing },
                  })
                }
                className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
              >
                {easingOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </PropertyRow>
          </>
        )}
      </Section>

      <Section title="Scroll Animation">
        <PropertyRow label="Reveal on Viewport">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={scroll.enabled}
              onChange={(e) =>
                setAnimation(sectionId, {
                  scroll: { ...scroll, enabled: e.target.checked },
                })
              }
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-muted/40 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-foreground after:transition-all peer-checked:bg-primary-500 peer-checked:after:translate-x-full" />
          </label>
        </PropertyRow>
        {scroll.enabled && (
          <PropertyRow label="Parallax Speed">
            <Slider
              value={scroll.parallaxSpeed}
              min={0}
              max={1}
              step={0.1}
              unit=""
              onChange={(v) =>
                setAnimation(sectionId, {
                  scroll: { ...scroll, parallaxSpeed: v },
                })
              }
            />
          </PropertyRow>
        )}
      </Section>

      <Section title="Stagger">
        <PropertyRow label="Stagger Children">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={stagger.enabled}
              onChange={(e) =>
                setAnimation(sectionId, {
                  stagger: { ...stagger, enabled: e.target.checked },
                })
              }
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-muted/40 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-foreground after:transition-all peer-checked:bg-primary-500 peer-checked:after:translate-x-full" />
          </label>
        </PropertyRow>
        {stagger.enabled && (
          <PropertyRow label="Stagger Delay">
            <Slider
              value={stagger.staggerDelay}
              min={0.05}
              max={0.5}
              step={0.05}
              unit="s"
              onChange={(v) =>
                setAnimation(sectionId, {
                  stagger: { ...stagger, staggerDelay: v },
                })
              }
            />
          </PropertyRow>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground min-w-[72px]">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Slider({
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1 w-full appearance-none rounded-full bg-muted accent-primary-500 cursor-pointer"
      />
      <span className="w-10 text-right text-[10px] text-muted-foreground">
        {value}
        {unit}
      </span>
    </div>
  );
}
