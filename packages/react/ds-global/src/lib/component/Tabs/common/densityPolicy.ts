/** Private DOM-scoped policy for a static Chip in a Tabs indicator slot. */
export const tabsDensityPolicy = {
  version: 1,
  provider: "tabs-static-chip",
  providerClassName: "tabs-static-chip-provider-v1",
  subscriber: "static-chip",
  role: "spacing.inset.control.block",
  member: "dense",
  source: "--ds-spacing-control-inset-dense",
  providerSelector: ".ds.tabs-link.tabs-static-chip-provider-v1",
  subscriberSelector:
    '> .tabs-indicator span.chip[data-ds-density-subscriber="static-chip"]',
  helperInputs: {
    padding: "--ds-control-seat-padding-block",
    closure: "--ds-control-seat-margin-block-end",
  },
  hostAbsorption:
    "subtract the eligible static Chip dense inset from the existing host control padding, clamped at zero",
  boundary: "tabs.static-indicator.static-chip.v1",
  resets: ["global", "site", "docs", "app", "os"],
  portalBoundary: "dom-target.v1",
  resetBoundary: "product-root.v1",
  wrapperBoundary: "neutral descendants inherit; product roots reset",
  portals: "actual DOM target; no React-context propagation",
  exclusions: ["interactive Chip", "dismissible Chip", "other controls"],
} as const;
