import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { navigationDensityPolicy as policy } from "./densityPolicy.js";

describe("navigation density policy", () => {
  it("keeps the versioned eligibility contract aligned with the CSS boundary", () => {
    const css = readFileSync(
      "src/lib/SideNavigation/common/density.css",
      "utf8",
    ).replace(/\s+/g, " ");
    expect(css).toContain(policy.providerSelector);
    expect(css).toContain(policy.subscriberSelector);
    expect(css).toContain(`var(${policy.source})`);
    for (const input of Object.values(policy.helperInputs))
      expect(css).toContain(`${input}:`);
    for (const reset of policy.resets) expect(css).toContain(reset);
    expect(css).toContain(":has(button, a, input, select, textarea)");
    expect(policy.role).toBe("spacing.inset.control.block");
    expect(policy.member).toBe("dense");
    expect(css).not.toContain("data-ds-density-reset");
    expect(policy.resets).toEqual(["site", "docs", "app"]);
    expect(policy.resetBoundary).toBe("product-root.v1");
  });
});
