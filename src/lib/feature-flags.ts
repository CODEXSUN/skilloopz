import { prisma } from "@/lib/db";

export async function isFeatureEnabled(key: string): Promise<boolean> {
  try {
    const flag = await prisma.featureFlag.findUnique({ where: { key } });
    return flag?.enabled ?? false;
  } catch {
    return false;
  }
}

export interface FeatureFlagInfo {
  id: string;
  key: string;
  label: string;
  description: string | null;
  enabled: boolean;
  updatedAt: Date;
}

export async function getAllFlags(): Promise<FeatureFlagInfo[]> {
  return prisma.featureFlag.findMany({
    orderBy: { key: "asc" },
  });
}

export async function toggleFlag(key: string, enabled: boolean): Promise<FeatureFlagInfo> {
  return prisma.featureFlag.update({
    where: { key },
    data: { enabled },
  });
}

const DEFAULT_FLAGS: { key: string; label: string; description: string; enabled: boolean }[] = [
  { key: "dev_mode", label: "Developer Mode", description: "Enable the Dev Mode visual editor for all admin users", enabled: true },
  { key: "template_library", label: "Template Library", description: "Allow saving and applying page templates", enabled: true },
  { key: "reusable_blocks", label: "Reusable Blocks", description: "Allow saving and reusing blocks across pages", enabled: true },
  { key: "animation_studio", label: "Animation Studio", description: "Enable the animation timeline editor", enabled: true },
  { key: "data_binding", label: "Data Binding", description: "Allow sections to bind to dynamic data sources", enabled: true },
  { key: "audit_logs", label: "Audit Logging", description: "Track all admin actions in the audit log", enabled: true },
  { key: "draft_preview", label: "Draft Preview", description: "Allow previewing draft pages before publishing", enabled: true },
  { key: "responsive_editing", label: "Responsive Editing", description: "Enable per-breakpoint style overrides", enabled: true },
  { key: "beta_onboarding", label: "New Onboarding (Beta)", description: "Use the new step-based onboarding flow", enabled: false },
  { key: "beta_analytics", label: "Enhanced Analytics (Beta)", description: "Show advanced analytics charts and reports", enabled: true },
  { key: "performance_inspector", label: "Performance Inspector", description: "Show page composition and size analysis in Dev Mode", enabled: true },
];

export async function ensureDefaultFlags(): Promise<void> {
  const count = await prisma.featureFlag.count();
  if (count > 0) return;

  for (const flag of DEFAULT_FLAGS) {
    await prisma.featureFlag.create({ data: flag });
  }
}
