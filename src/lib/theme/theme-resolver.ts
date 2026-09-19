import { parseTokens, tokensToCssVars, type ThemeTokens } from "@/lib/theme/theme-converter";

export interface ThemeLayer {
  tokens: string | Record<string, unknown>;
  weight: number;
}

export interface ResolvedTheme {
  tokens: ThemeTokens;
  cssVars: Record<string, string>;
  layers: string[];
}

const defaultTokens: ThemeTokens = parseTokens("{}");

const SYSTEM_WEIGHT = 0;
const GLOBAL_WEIGHT = 1;
const COURSE_WEIGHT = 2;
const STUDENT_WEIGHT = 3;
const BLOCK_WEIGHT = 4;

function deepMergeTokens(base: ThemeTokens, override: string | Record<string, unknown>): ThemeTokens {
  const parsed = parseTokens(override);
  return {
    colors: { ...base.colors, ...parsed.colors },
    typography: { ...base.typography, ...parsed.typography },
    radii: { ...base.radii, ...parsed.radii },
    animations: { ...base.animations, ...parsed.animations },
  };
}

export function resolveTheme(layers: ThemeLayer[]): ResolvedTheme {
  const sorted = [...layers].sort((a, b) => a.weight - b.weight);

  let merged = defaultTokens;
  const appliedLayers: string[] = [];

  for (const layer of sorted) {
    if (layer.tokens) {
      merged = deepMergeTokens(merged, layer.tokens);
      appliedLayers.push(`weight=${layer.weight}`);
    }
  }

  return {
    tokens: merged,
    cssVars: tokensToCssVars(merged),
    layers: appliedLayers,
  };
}

export function buildThemeLayers(
  globalTokens?: string | Record<string, unknown> | null,
  courseTokens?: string | Record<string, unknown> | null,
  studentTokens?: string | Record<string, unknown> | null,
  blockTokens?: string | Record<string, unknown> | null,
): ThemeLayer[] {
  const layers: ThemeLayer[] = [];

  if (globalTokens) layers.push({ tokens: globalTokens, weight: GLOBAL_WEIGHT });
  if (courseTokens) layers.push({ tokens: courseTokens, weight: COURSE_WEIGHT });
  if (studentTokens) layers.push({ tokens: studentTokens, weight: STUDENT_WEIGHT });
  if (blockTokens) layers.push({ tokens: blockTokens, weight: BLOCK_WEIGHT });

  return layers;
}

export { SYSTEM_WEIGHT, GLOBAL_WEIGHT, COURSE_WEIGHT, STUDENT_WEIGHT, BLOCK_WEIGHT };
