"use client";

import { usePageBuilderStore } from "@/stores/pageBuilderStore";
import type { InteractionAction } from "@/lib/interaction-engine";

type ActionType = InteractionAction["type"] | "none";

const actionOptions: { value: ActionType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "navigate", label: "Navigate" },
  { value: "openModal", label: "Open Modal" },
  { value: "showToast", label: "Show Toast" },
  { value: "triggerApi", label: "Trigger API" },
  { value: "scrollTo", label: "Scroll To" },
  { value: "toggleClass", label: "Toggle Class" },
];

interface InteractionConfig {
  onClick?: InteractionAction;
  onHover?: { action: InteractionAction; delay?: number };
  onScrollIntoView?: { action: InteractionAction; threshold?: number };
}

function getInteractions(sectionId: string): InteractionConfig {
  const section = usePageBuilderStore.getState().sections.find((s) => s.id === sectionId);
  if (!section) return {};
  const raw = section.settings?.interactions;
  if (raw && typeof raw === "object") return raw as InteractionConfig;
  return {};
}

function setInteractions(sectionId: string, update: Partial<InteractionConfig>) {
  const current = getInteractions(sectionId);
  const merged = { ...current, ...update };
  usePageBuilderStore.getState().updateSection(sectionId, {
    settings: {
      ...usePageBuilderStore.getState().sections.find((s) => s.id === sectionId)?.settings,
      interactions: merged,
    },
  });
}

function setActionField(
  sectionId: string,
  parent: "onClick" | "onHover" | "onScrollIntoView",
  action: InteractionAction | undefined
) {
  setInteractions(sectionId, { [parent]: action });
}

interface InteractionsTabProps {
  sectionId: string;
}

export function InteractionsTab({ sectionId }: InteractionsTabProps) {
  const interactions = getInteractions(sectionId);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
      <Section title="On Click">
        <ActionEditor
          value={interactions.onClick}
          onChange={(a) => setActionField(sectionId, "onClick", a)}
        />
      </Section>

      <Section title="On Hover">
        <HoverEditor
          config={interactions.onHover}
          onChange={(v) => setInteractions(sectionId, { onHover: v })}
        />
      </Section>

      <Section title="On Scroll Into View">
        <ScrollEditor
          config={interactions.onScrollIntoView}
          onChange={(v) => setInteractions(sectionId, { onScrollIntoView: v })}
        />
      </Section>
    </div>
  );
}

function ActionEditor({
  value,
  onChange,
}: {
  value: InteractionAction | undefined;
  onChange: (action: InteractionAction | undefined) => void;
}) {
  const currentType: ActionType = value?.type ?? "none";

  return (
    <div className="space-y-2">
      <PropertyRow label="Action">
        <select
          value={currentType}
          onChange={(e) => {
            const t = e.target.value as ActionType;
            if (t === "none") {
              onChange(undefined);
              return;
            }
            onChange(defaultAction(t));
          }}
          className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
        >
          {actionOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </PropertyRow>
      {value && <ActionFields action={value} onChange={onChange} />}
    </div>
  );
}

function ActionFields({
  action,
  onChange,
}: {
  action: InteractionAction;
  onChange: (a: InteractionAction) => void;
}) {
  switch (action.type) {
    case "navigate":
      return (
        <PropertyRow label="URL">
          <input
            type="text"
            value={action.url}
            onChange={(e) => onChange({ ...action, url: e.target.value })}
            placeholder="https:// or /path"
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          />
        </PropertyRow>
      );
    case "openModal":
      return (
        <PropertyRow label="Modal ID">
          <input
            type="text"
            value={action.modalId}
            onChange={(e) => onChange({ ...action, modalId: e.target.value })}
            placeholder="modal-id"
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          />
        </PropertyRow>
      );
    case "showToast":
      return (
        <>
          <PropertyRow label="Message">
            <input
              type="text"
              value={action.message}
              onChange={(e) => onChange({ ...action, message: e.target.value })}
              placeholder="Toast message"
              className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
            />
          </PropertyRow>
          <PropertyRow label="Variant">
            <select
              value={action.variant ?? "default"}
              onChange={(e) =>
                onChange({
                  ...action,
                  variant: e.target.value as "default" | "success" | "error",
                })
              }
              className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
            >
              <option value="default">Default</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
            </select>
          </PropertyRow>
        </>
      );
    case "triggerApi":
      return (
        <>
          <PropertyRow label="URL">
            <input
              type="text"
              value={action.url}
              onChange={(e) => onChange({ ...action, url: e.target.value })}
              placeholder="https://api.example.com"
              className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
            />
          </PropertyRow>
          <PropertyRow label="Method">
            <select
              value={action.method ?? "GET"}
              onChange={(e) =>
                onChange({
                  ...action,
                  method: e.target.value as "GET" | "POST",
                })
              }
              className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
          </PropertyRow>
        </>
      );
    case "scrollTo":
      return (
        <PropertyRow label="Selector">
          <input
            type="text"
            value={action.selector}
            onChange={(e) => onChange({ ...action, selector: e.target.value })}
            placeholder="#section-id"
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          />
        </PropertyRow>
      );
    case "toggleClass":
      return (
        <PropertyRow label="Class Name">
          <input
            type="text"
            value={action.className}
            onChange={(e) => onChange({ ...action, className: e.target.value })}
            placeholder="dark-mode"
            className="w-full rounded-lg bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none ring-1 ring-border/50"
          />
        </PropertyRow>
      );
    default:
      return null;
  }
}

function defaultAction(type: ActionType): InteractionAction {
  switch (type) {
    case "navigate":
      return { type: "navigate", url: "" };
    case "openModal":
      return { type: "openModal", modalId: "" };
    case "showToast":
      return { type: "showToast", message: "" };
    case "triggerApi":
      return { type: "triggerApi", url: "" };
    case "scrollTo":
      return { type: "scrollTo", selector: "" };
    case "toggleClass":
      return { type: "toggleClass", className: "" };
    default:
      return { type: "navigate", url: "" };
  }
}

function HoverEditor({
  config,
  onChange,
}: {
  config: { action: InteractionAction; delay?: number } | undefined;
  onChange: (v: { action: InteractionAction; delay?: number } | undefined) => void;
}) {
  const hasAction = config !== undefined;

  return (
    <div className="space-y-2">
      <PropertyRow label="Enable Hover">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={hasAction}
            onChange={(e) => {
              if (e.target.checked) {
                onChange({ action: { type: "navigate", url: "" }, delay: 0 });
              } else {
                onChange(undefined);
              }
            }}
            className="peer sr-only"
          />
          <div className="h-5 w-9 rounded-full bg-muted/40 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-foreground after:transition-all peer-checked:bg-primary-500 peer-checked:after:translate-x-full" />
        </label>
      </PropertyRow>
      {hasAction && (
        <>
          <ActionEditor
            value={config.action}
            onChange={(a) => {
              if (a) onChange({ ...config, action: a });
            }}
          />
          <PropertyRow label="Delay (ms)">
            <input
              type="range"
              min={0}
              max={2000}
              step={100}
              value={config.delay ?? 0}
              onChange={(e) => onChange({ ...config, delay: parseInt(e.target.value, 10) })}
              className="h-1 w-full appearance-none rounded-full bg-muted accent-primary-500 cursor-pointer"
            />
            <span className="w-10 text-right text-[10px] text-muted-foreground">
              {config.delay ?? 0}ms
            </span>
          </PropertyRow>
        </>
      )}
    </div>
  );
}

function ScrollEditor({
  config,
  onChange,
}: {
  config: { action: InteractionAction; threshold?: number } | undefined;
  onChange: (v: { action: InteractionAction; threshold?: number } | undefined) => void;
}) {
  const hasAction = config !== undefined;

  return (
    <div className="space-y-2">
      <PropertyRow label="Enable Scroll">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={hasAction}
            onChange={(e) => {
              if (e.target.checked) {
                onChange({ action: { type: "navigate", url: "" }, threshold: 0.3 });
              } else {
                onChange(undefined);
              }
            }}
            className="peer sr-only"
          />
          <div className="h-5 w-9 rounded-full bg-muted/40 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-foreground after:transition-all peer-checked:bg-primary-500 peer-checked:after:translate-x-full" />
        </label>
      </PropertyRow>
      {hasAction && (
        <>
          <ActionEditor
            value={config.action}
            onChange={(a) => {
              if (a) onChange({ ...config, action: a });
            }}
          />
          <PropertyRow label="Threshold">
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={config.threshold ?? 0.3}
              onChange={(e) => onChange({ ...config, threshold: parseFloat(e.target.value) })}
              className="h-1 w-full appearance-none rounded-full bg-muted accent-primary-500 cursor-pointer"
            />
            <span className="w-10 text-right text-[10px] text-muted-foreground">
              {config.threshold ?? 0.3}
            </span>
          </PropertyRow>
        </>
      )}
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
