import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { tabsDensityPolicy as policy } from "./densityPolicy.js";

const densityCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "density.css"),
  "utf-8",
);

describe("Tabs static-indicator density policy", () => {
  it("keeps the runtime identifiers and selectors synchronized", () => {
    expect(policy).toMatchObject({
      version: 1,
      provider: "tabs-static-chip",
      providerClassName: "tabs-static-chip-provider-v1",
      subscriber: "static-chip",
      providerSelector: ".ds.tabs-link.tabs-static-chip-provider-v1",
      subscriberSelector:
        '> .tabs-indicator span.chip[data-ds-density-subscriber="static-chip"]',
      boundary: "tabs.static-indicator.static-chip.v1",
    });
    expect(densityCss).toContain(policy.providerClassName);
    expect(densityCss).toContain(
      'span.chip[data-ds-density-subscriber="static-chip"]',
    );
    expect(densityCss).toContain(
      "--tabs-static-chip-inset: var(--ds-spacing-control-inset-dense)",
    );
    expect(densityCss).toContain("--ds-control-seat-padding-block: var(");
    expect(densityCss).toContain("--ds-control-seat-margin-block-end: var(");
  });

  it("preserves neutral wrappers, resets product roots and excludes interactive descendants", () => {
    expect(densityCss).toContain("> .tabs-indicator\n    span.chip");
    expect(densityCss).not.toContain("> .tabs-indicator > span.chip");
    expect(densityCss).toContain(":is(.global, .site, .docs, .app, .os)");
    expect(densityCss).toContain(":has(button, a, input, select, textarea)");
  });
});
