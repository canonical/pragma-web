export const MODIFIER_FAMILIES = {
  criticality: ["default", "success", "error", "warning", "information"],
  anticipation: ["default", "constructive", "destructive", "caution"],
  importance: ["primary", "secondary", "tertiary"],
  emphasis: ["default", "muted", "branded"],
  // compact is launchpad-only; the global density family is comfortable/dense
  density: ["dense", "compact", "comfortable"],
} as const satisfies Record<string, readonly string[]>;
