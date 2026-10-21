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
    expect(css).toContain(
      ".ds.row.sidenav-static-chip-provider-v1 > .end :is(.global, .site, .docs, .app, .os) ) { --sidenav-static-chip-inset: initial; --sidenav-static-chip-end: initial;",
    );
    expect(css).toContain(
      "--ds-control-seat-padding-block: var( --sidenav-static-chip-inset, var(--ds-control-padding-block) );",
    );
    expect(css).not.toContain("@scope");
    expect(policy.role).toBe("spacing.inset.control.block");
    expect(policy.member).toBe("dense");
    expect(css).not.toContain("data-ds-density-reset");
    expect(policy.resets).toEqual(["global", "site", "docs", "app", "os"]);
    expect(policy.resetBoundary).toBe("product-root.v1");
    expect(policy.wrapperBoundary).toBe(
      "neutral descendants inherit; product roots reset",
    );
  });
});
