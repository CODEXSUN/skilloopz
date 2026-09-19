"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type ResultStatus = "pass" | "warning" | "fail";
type CheckCategory = "contrast" | "headings" | "alt" | "aria" | "keyboard" | "forms" | "landmarks";

interface CheckResult {
  id: string;
  category: CheckCategory;
  status: ResultStatus;
  message: string;
  element?: Element;
  details?: string;
}

interface TabStop {
  index: number;
  element: Element;
  tag: string;
  text: string;
  hasVisibleFocus: boolean;
  role: string;
}

/* ─── Contrast ─── */

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number {
  const l1 = luminance(c1.r, c1.g, c1.b);
  const l2 = luminance(c2.r, c2.g, c2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRGB(str: string): { r: number; g: number; b: number } | null {
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return m ? { r: +m[1], g: +m[2], b: +m[3] } : null;
}

function getEffectiveBg(el: Element): string {
  let current: Element | null = el;
  while (current) {
    const bg = window.getComputedStyle(current).getPropertyValue("background-color");
    const rgb = parseRGB(bg);
    if (rgb && (rgb.r !== 0 || rgb.g !== 0 || rgb.b !== 0)) return bg;
    current = current.parentElement;
  }
  return "rgb(255, 255, 255)";
}

function checkContrast(): CheckResult[] {
  const results: CheckResult[] = [];
  const selectors = "p, h1, h2, h3, h4, h5, h6, span:not([aria-hidden]), a, li, label, button, input, textarea, select";
  const textEls = Array.from(document.querySelectorAll<HTMLElement>(selectors));
  const checked = new Set<Element>();

  textEls.forEach((el) => {
    if (checked.has(el) || el.closest("[data-dev-mode]")) return;
    checked.add(el);
    const color = window.getComputedStyle(el).getPropertyValue("color");
    const bg = getEffectiveBg(el);
    const fg = parseRGB(color);
    const bgRgb = parseRGB(bg);
    if (!fg || !bgRgb) return;

    const ratio = contrastRatio(fg, bgRgb);
    const tag = el.tagName.toLowerCase();
    const isLarge = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag);
    const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
    const isLargeBySize = fontSize >= 18 || (fontSize >= 14 && parseFloat(window.getComputedStyle(el).fontWeight) >= 700);
    const threshold = (isLarge || isLargeBySize) ? 3 : 4.5;

    if (ratio < threshold) {
      results.push({
        id: `contrast-${el.tagName}-${results.length}`,
        category: "contrast",
        status: "fail",
        message: `${tag} — ratio ${ratio.toFixed(2)}:1 (needs ≥ ${threshold}:1)`,
        element: el,
        details: `Foreground: ${color}, Background: ${bg}`,
      });
    }
  });

  if (results.length === 0) {
    results.push({ id: "contrast-pass", category: "contrast", status: "pass", message: "All text meets WCAG contrast requirements" });
  }
  return results;
}

/* ─── Headings ─── */

function checkHeadings(): CheckResult[] {
  const results: CheckResult[] = [];
  const headings = Array.from(document.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6"));

  if (headings.length === 0) {
    results.push({ id: "headings-none", category: "headings", status: "fail", message: "Page has no heading elements" });
    return results;
  }

  const h1s = headings.filter((h) => h.tagName === "H1");
  if (h1s.length === 0) {
    results.push({ id: "headings-no-h1", category: "headings", status: "fail", message: "Page is missing an h1 element" });
  } else if (h1s.length > 1) {
    results.push({ id: "headings-multi-h1", category: "headings", status: "warning", message: `Page has ${h1s.length} h1 elements (should have exactly 1)` });
  }

  let prevLevel = 0;
  let hasGap = false;
  const hierarchy: { level: number; text: string }[] = [];
  headings.forEach((h) => {
    const level = parseInt(h.tagName[1]);
    hierarchy.push({ level, text: h.textContent?.trim().slice(0, 60) ?? "" });
    if (prevLevel !== 0 && level > prevLevel + 1) hasGap = true;
    prevLevel = level;
  });

  if (hasGap) {
    results.push({ id: "headings-gap", category: "headings", status: "warning", message: "Heading hierarchy has gaps (e.g. h2 → h4 skipping h3)" });
  }

  const treeLines = hierarchy.map((h) => `${"  ".repeat(h.level - 1)}h${h.level}: ${h.text || "(empty)"}`).join("\n");
  results.push({
    id: "headings-tree",
    category: "headings",
    status: hasGap ? "warning" : "pass",
    message: `${headings.length} headings found — hierarchy:`,
    details: treeLines,
  });

  return results;
}

/* ─── Alt Text ─── */

function checkAltText(): CheckResult[] {
  const results: CheckResult[] = [];
  const images = Array.from(document.querySelectorAll<HTMLImageElement>("img:not([data-dev-mode])"));

  if (images.length === 0) {
    results.push({ id: "alt-none", category: "alt", status: "pass", message: "No images on page" });
    return results;
  }

  images.forEach((img) => {
    const alt = img.getAttribute("alt");
    const src = img.src.split("/").pop()?.split("?")[0] ?? "unknown";
    if (alt === null) {
      results.push({ id: `alt-missing-${src}`, category: "alt", status: "fail", message: `img "${src}" missing alt attribute`, element: img });
    } else if (alt.trim() === "" && !img.getAttribute("role")?.includes("presentation")) {
      results.push({ id: `alt-empty-${src}`, category: "alt", status: "warning", message: `img "${src}" has empty alt (ok if decorative)`, element: img });
    }
  });

  const svgs = Array.from(document.querySelectorAll<SVGSVGElement>("svg:not([aria-hidden])"));
  svgs.forEach((svg) => {
    const labelled = svg.getAttribute("aria-label") || svg.getAttribute("aria-labelledby") || svg.querySelector("title");
    if (!labelled && svg.getAttribute("role") !== "img") {
      results.push({ id: `svg-unlabelled`, category: "alt", status: "warning", message: "SVG element may lack accessible label", element: svg });
    }
  });

  if (results.length === 0) {
    results.push({ id: "alt-pass", category: "alt", status: "pass", message: "All images have appropriate alt text" });
  }
  return results;
}

/* ─── ARIA ─── */

function checkAria(): CheckResult[] {
  const results: CheckResult[] = [];

  document.querySelectorAll<HTMLElement>("[role='button']").forEach((btn) => {
    if (!(btn instanceof HTMLButtonElement) && !btn.getAttribute("tabindex") && btn.getAttribute("tabindex") !== "0") {
      results.push({ id: "aria-role-btn-tab", category: "aria", status: "warning", message: "Element with role='button' missing tabindex='0'", element: btn });
    }
  });

  document.querySelectorAll<HTMLElement>("[role='img']").forEach((img) => {
    if (!img.getAttribute("aria-label") && !img.getAttribute("aria-labelledby")) {
      results.push({ id: "aria-role-img-label", category: "aria", status: "fail", message: "Element with role='img' missing aria-label", element: img });
    }
  });

  document.querySelectorAll<HTMLElement>("[role='dialog'], [role='alertdialog']").forEach((d) => {
    if (!d.getAttribute("aria-labelledby") && !d.getAttribute("aria-label")) {
      results.push({ id: "aria-dialog-label", category: "aria", status: "warning", message: "Dialog missing accessible name", element: d });
    }
  });

  document.querySelectorAll<HTMLElement>("[aria-live]").forEach((r) => {
    const val = r.getAttribute("aria-live");
    if (!["polite", "assertive", "off"].includes(val ?? "")) {
      results.push({ id: "aria-live-invalid", category: "aria", status: "warning", message: `Invalid aria-live="${val}"`, element: r });
    }
  });

  document.querySelectorAll<HTMLElement>("input, textarea, select").forEach((el) => {
    const labelled = el.getAttribute("aria-labelledby") || el.getAttribute("aria-label") || el.getAttribute("title");
    if (labelled) return;
    const elId = el.getAttribute("id");
    if (elId && document.querySelector(`label[for="${elId}"]`)) return;
    if (el.closest("label")) return;
    if (el.getAttribute("type") === "hidden") return;
    results.push({ id: `aria-input-${el.tagName}`, category: "aria", status: "warning", message: `${el.tagName.toLowerCase()} lacks accessible label`, element: el });
  });

  const duplicateIds = new Set<string>();
  const seenIds = new Set<string>();
  document.querySelectorAll<HTMLElement>("[id]").forEach((el) => {
    const id = el.id;
    if (seenIds.has(id)) duplicateIds.add(id);
    seenIds.add(id);
  });
  if (duplicateIds.size > 0) {
    results.push({ id: "aria-dup-ids", category: "aria", status: "fail", message: `Duplicate IDs found: ${Array.from(duplicateIds).join(", ")}` });
  }

  if (results.length === 0) {
    results.push({ id: "aria-pass", category: "aria", status: "pass", message: "No common ARIA violations detected" });
  }
  return results;
}

/* ─── Keyboard Navigation ─── */

function checkKeyboard(): CheckResult[] {
  const results: CheckResult[] = [];
  const focusableSelectors = [
    "a[href]", "button:not([disabled])", "input:not([disabled])",
    "select:not([disabled])", "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])", "[contenteditable]",
  ].join(", ");

  const focusable = Array.from(document.querySelectorAll<HTMLElement>(focusableSelectors))
    .filter((el) => !el.closest("[data-dev-mode]"))
    .filter((el) => el.offsetParent !== null);

  if (focusable.length === 0) {
    results.push({ id: "kb-none", category: "keyboard", status: "warning", message: "No focusable elements found on page" });
    return results;
  }

  const tabStops: TabStop[] = focusable.map((el, i) => ({
    index: i,
    element: el,
    tag: el.tagName.toLowerCase(),
    text: (el.textContent ?? el.getAttribute("aria-label") ?? "").trim().slice(0, 40),
    hasVisibleFocus: (() => {
      const style = window.getComputedStyle(el);
      return style.outlineStyle !== "none" || style.boxShadow !== "none" || style.outline !== "none";
    })(),
    role: el.getAttribute("role") ?? el.tagName.toLowerCase(),
  }));

  const noFocusStyle = tabStops.filter((t) => !t.hasVisibleFocus);
  if (noFocusStyle.length > 0) {
    results.push({
      id: "kb-focus-style",
      category: "keyboard",
      status: "warning",
      message: `${noFocusStyle.length} focusable element(s) lack visible focus indicator`,
      details: noFocusStyle.map((t) => `${t.tag}[${t.index}]: ${t.text || "(no text)"}`).join("\n"),
    });
  }

  const negativeTabindex = focusable.filter((el) => el.getAttribute("tabindex") === "-1");
  if (negativeTabindex.length > 0) {
    results.push({
      id: "kb-negative-tab",
      category: "keyboard",
      status: "warning",
      message: `${negativeTabindex.length} element(s) have tabindex="-1" (removed from tab order)`,
    });
  }

  const positiveTabindex = focusable.filter((el) => {
    const ti = parseInt(el.getAttribute("tabindex") ?? "0");
    return ti > 0;
  });
  if (positiveTabindex.length > 0) {
    results.push({
      id: "kb-positive-tab",
      category: "keyboard",
      status: "warning",
      message: `${positiveTabindex.length} element(s) have positive tabindex (may cause unpredictable tab order)`,
    });
  }

  const tabOrder = tabStops.map((t) => `${t.index + 1}. <${t.tag}> ${t.text}`).join("\n");
  results.push({
    id: "kb-tab-order",
    category: "keyboard",
    status: noFocusStyle.length === 0 ? "pass" : "warning",
    message: `Tab order: ${tabStops.length} focusable elements`,
    details: tabOrder,
  });

  return results;
}

/* ─── Forms ─── */

function checkForms(): CheckResult[] {
  const results: CheckResult[] = [];

  document.querySelectorAll<HTMLFormElement>("form").forEach((form) => {
    if (!form.getAttribute("aria-label") && !form.getAttribute("aria-labelledby")) {
      const hasTitle = form.querySelector("h1, h2, h3, h4, h5, h6");
      if (!hasTitle) {
        results.push({ id: `form-unlabelled`, category: "forms", status: "warning", message: "Form lacks accessible name", element: form });
      }
    }
  });

  const requiredWithoutIndicator = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[required], textarea[required]"))
    .filter((el) => {
      const parent = el.closest("label, div, form");
      return !parent?.textContent?.includes("*") && !parent?.textContent?.includes("required");
    });
  if (requiredWithoutIndicator.length > 0) {
    results.push({
      id: "form-required",
      category: "forms",
      status: "warning",
      message: `${requiredWithoutIndicator.length} required field(s) lack visual indicator`,
    });
  }

  if (results.length === 0) {
    results.push({ id: "forms-pass", category: "forms", status: "pass", message: "No form accessibility issues detected" });
  }
  return results;
}

/* ─── Landmarks ─── */

function checkLandmarks(): CheckResult[] {
  const results: CheckResult[] = [];

  const hasMain = document.querySelector("main, [role='main']");
  if (!hasMain) {
    results.push({ id: "landmark-no-main", category: "landmarks", status: "fail", message: "Page lacks a <main> landmark" });
  }

  const hasNav = document.querySelector("nav, [role='navigation']");
  if (!hasNav) {
    results.push({ id: "landmark-no-nav", category: "landmarks", status: "warning", message: "Page lacks a <nav> landmark" });
  }

  const mains = document.querySelectorAll("main, [role='main']");
  if (mains.length > 1) {
    results.push({ id: "landmark-multi-main", category: "landmarks", status: "warning", message: `Page has ${mains.length} main landmarks (should have 1)` });
  }

  const landmarks = Array.from(document.querySelectorAll<HTMLElement>("header, nav, main, footer, aside, section, article, form, [role]"));
  const landmarkList = landmarks
    .filter((el) => !el.closest("[data-dev-mode]"))
    .map((el) => {
      const role = el.getAttribute("role") ?? el.tagName.toLowerCase();
      const label = el.getAttribute("aria-label") ?? el.getAttribute("aria-labelledby") ?? "";
      return `${role}${label ? ` "${label}"` : ""}`;
    });

  if (landmarkList.length > 0) {
    results.push({
      id: "landmark-list",
      category: "landmarks",
      status: "pass",
      message: `${landmarkList.length} landmarks found: ${landmarkList.join(", ")}`,
    });
  }

  if (results.length === 0) {
    results.push({ id: "landmarks-pass", category: "landmarks", status: "pass", message: "Page landmarks are well structured" });
  }
  return results;
}

/* ─── Check Registry ─── */

type CheckFn = () => CheckResult[];

const checks: { key: CheckCategory; label: string; icon: string; fn: CheckFn }[] = [
  { key: "contrast", label: "Contrast", icon: "◐", fn: checkContrast },
  { key: "headings", label: "Headings", icon: "H", fn: checkHeadings },
  { key: "alt", label: "Alt Text", icon: "🖼", fn: checkAltText },
  { key: "aria", label: "ARIA", icon: "♿", fn: checkAria },
  { key: "keyboard", label: "Keyboard", icon: "⌨", fn: checkKeyboard },
  { key: "forms", label: "Forms", icon: "📝", fn: checkForms },
  { key: "landmarks", label: "Landmarks", icon: "📍", fn: checkLandmarks },
];

/* ─── Highlight Overlay ─── */

function highlightElements(results: CheckResult[]) {
  document.querySelectorAll("[data-a11y-highlight]").forEach((el) => el.removeAttribute("data-a11y-highlight"));
  results.forEach((r) => {
    if (r.element && r.status !== "pass") {
      (r.element as HTMLElement).setAttribute("data-a11y-highlight", r.status);
    }
  });
}

function clearHighlights() {
  document.querySelectorAll("[data-a11y-highlight]").forEach((el) => el.removeAttribute("data-a11y-highlight"));
}

/* ─── Component ─── */

const statusColors: Record<ResultStatus, string> = {
  pass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  fail: "bg-red-500/15 text-red-400 border-red-500/25",
};

const categoryLabels: Record<CheckCategory, string> = {
  contrast: "Contrast",
  headings: "Headings",
  alt: "Alt Text",
  aria: "ARIA",
  keyboard: "Keyboard",
  forms: "Forms",
  landmarks: "Landmarks",
};

export function AccessibilityTools() {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CheckCategory | "all">("all");
  const [expandedDetails, setExpandedDetails] = useState<string | null>(null);
  const overlayRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (showOverlay && results.length > 0) {
      const style = document.createElement("style");
      style.id = "a11y-highlight-style";
      style.textContent = `
        [data-a11y-highlight="fail"] { outline: 3px solid #ef4444 !important; outline-offset: 2px; }
        [data-a11y-highlight="warning"] { outline: 3px solid #f59e0b !important; outline-offset: 2px; }
      `;
      document.head.appendChild(style);
      overlayRef.current = style;
      highlightElements(results);
    } else {
      overlayRef.current?.remove();
      clearHighlights();
    }
    return () => { overlayRef.current?.remove(); clearHighlights(); };
  }, [showOverlay, results]);

  const runCheck = useCallback((key: string, fn: CheckFn) => {
    setRunning(key);
    setResults([]);
    requestAnimationFrame(() => {
      const res = fn();
      setResults(res);
      setRunning(null);
    });
  }, []);

  const runAll = useCallback(() => {
    setResults([]);
    setRunning("all");
    requestAnimationFrame(() => {
      const all: CheckResult[] = [];
      for (const c of checks) all.push(...c.fn());
      setResults(all);
      setRunning(null);
    });
  }, []);

  const filtered = activeCategory === "all" ? results : results.filter((r) => r.category === activeCategory);
  const failCount = results.filter((r) => r.status === "fail").length;
  const warnCount = results.filter((r) => r.status === "warning").length;
  const passCount = results.filter((r) => r.status === "pass").length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-foreground">Accessibility Audit</h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          WCAG 2.1 checks for the current page
        </p>
      </div>

      {/* Summary */}
      {results.length > 0 && (
        <div className="flex gap-2">
          {failCount > 0 && <span className="flex-1 rounded bg-red-500/10 px-2 py-1 text-center text-[10px] font-bold text-red-400">{failCount} Fail</span>}
          {warnCount > 0 && <span className="flex-1 rounded bg-amber-500/10 px-2 py-1 text-center text-[10px] font-bold text-amber-400">{warnCount} Warn</span>}
          {passCount > 0 && <span className="flex-1 rounded bg-emerald-500/10 px-2 py-1 text-center text-[10px] font-bold text-emerald-400">{passCount} Pass</span>}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-1.5">
        {checks.map((c) => (
          <button
            key={c.key}
            onClick={() => runCheck(c.key, c.fn)}
            disabled={running !== null}
            className="inline-flex items-center gap-1 rounded-md bg-muted/20 px-2 py-1 text-[10px] font-medium text-foreground outline-none ring-1 ring-border/40 transition-all hover:bg-muted/40 disabled:opacity-50"
          >
            {c.icon} {c.label}
          </button>
        ))}
        <button
          onClick={runAll}
          disabled={running !== null}
          className="inline-flex items-center gap-1 rounded-md bg-primary-500/20 px-2 py-1 text-[10px] font-bold text-primary-400 outline-none ring-1 ring-primary-500/30 transition-all hover:bg-primary-500/30 disabled:opacity-50"
        >
          All
        </button>
        {results.length > 0 && (
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold outline-none ring-1 transition-all ${
              showOverlay
                ? "bg-violet-500/20 text-violet-400 ring-violet-500/30"
                : "bg-muted/20 text-muted-foreground ring-border/40"
            }`}
          >
            {showOverlay ? "👁 Hide" : "👁 Show"} Overlay
          </button>
        )}
      </div>

      {/* Category filter */}
      {results.length > 0 && (
        <div className="flex gap-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded px-2 py-0.5 text-[9px] font-bold transition-all ${activeCategory === "all" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            All ({results.length})
          </button>
          {(["contrast", "headings", "alt", "aria", "keyboard", "forms", "landmarks"] as CheckCategory[]).map((cat) => {
            const count = results.filter((r) => r.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded px-2 py-0.5 text-[9px] font-bold transition-all ${activeCategory === cat ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {categoryLabels[cat]} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      {filtered.length > 0 && (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="rounded-md border border-border/40 bg-muted/5 px-3 py-2"
            >
              <div className="flex items-start gap-2">
                <span className={`mt-0.5 inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${statusColors[r.status]}`}>
                  {r.status}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-foreground">{r.message}</p>
                  {r.details && (
                    <button
                      onClick={() => setExpandedDetails(expandedDetails === r.id ? null : r.id)}
                      className="mt-1 text-[9px] text-muted-foreground hover:text-foreground"
                    >
                      {expandedDetails === r.id ? "▾ Hide details" : "▸ Show details"}
                    </button>
                  )}
                  {expandedDetails === r.id && r.details && (
                    <pre className="mt-1 whitespace-pre-wrap rounded bg-black/30 p-2 text-[9px] font-mono text-muted-foreground">
                      {r.details}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && running === null && (
        <div className="rounded-md border border-dashed border-border/40 px-4 py-8 text-center">
          <p className="text-[10px] text-muted-foreground">Click a check above to scan the page</p>
        </div>
      )}

      {running !== null && (
        <div className="flex items-center gap-2 rounded-md bg-muted/10 px-3 py-2">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
          <span className="text-[10px] text-muted-foreground">Running {running === "all" ? "all checks" : running}...</span>
        </div>
      )}
    </div>
  );
}
