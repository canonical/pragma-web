/** Private DOM-scoped policy; React portals use their actual target ancestry. */
export const navigationDensityPolicy = {
  version: 1,
  provider: "navigation-static-chip",
  providerClassName: "sidenav-static-chip-provider-v1",
  subscriber: "static-chip",
  role: "spacing.inset.control.block",
  member: "dense",
  source: "--ds-spacing-control-inset-dense",
  providerSelector: ".ds.row.sidenav-static-chip-provider-v1",
  subscriberSelector:
    '> .end > span.chip[data-ds-density-subscriber="static-chip"]',
  helperInputs: {
    padding: "--ds-control-seat-padding-block",
    closure: "--ds-control-seat-margin-block-end",
  },
  boundary: "navigation.trailing-slot.direct-static-chip.v1",
  resets: ["site", "docs", "app", "data-ds-density-reset"],
  portalBoundary: "dom-target.v1",
  resetBoundary: "product-or-explicit-wrapper.v1",
  portals: "actual DOM target; no React-context propagation",
  exclusions: ["interactive Chip", "dismissible Chip", "other controls"],
} as const;
