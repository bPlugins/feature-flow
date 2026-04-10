export const PLAN_LIMITS = {
  free: {
    projects: 1,
    feedbackPerProject: 100,
    roadmapItems: 10,
    changelogEntries: 10,
    label: "Free",
    price: 0,
  },
  pro: {
    projects: 5,
    feedbackPerProject: 1000,
    roadmapItems: 100,
    changelogEntries: 100,
    label: "Pro",
    price: 19,
  },
  team: {
    projects: -1, // unlimited
    feedbackPerProject: -1,
    roadmapItems: -1,
    changelogEntries: -1,
    label: "Team",
    price: 49,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[(plan as PlanType) || "free"] || PLAN_LIMITS.free;
}

export function canCreateProject(plan: string, currentCount: number): boolean {
  const limits = getPlanLimits(plan);
  if (limits.projects === -1) return true;
  return currentCount < limits.projects;
}

export function getUpgradeMessage(plan: string): string {
  const limits = getPlanLimits(plan);
  if (plan === "free") {
    return `Free plan allows ${limits.projects} project. Upgrade to Pro for up to ${PLAN_LIMITS.pro.projects} projects.`;
  }
  if (plan === "pro") {
    return `Pro plan allows ${limits.projects} projects. Upgrade to Team for unlimited projects.`;
  }
  return "";
}
