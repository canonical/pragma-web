import { describe, expect, it } from "vitest";
import buildSettledPage from "./buildSettledPage.js";
import exactly from "./exactly.js";

describe("buildSettledPage", () => {
  it("is a page of that many identities, counting only what it is told", () => {
    const page = buildSettledPage({ rows: 2, pageable: exactly(9) });
    expect(page.rows).toEqual([{ id: "m0" }, { id: "m1" }]);
    expect(page.counts.pageable).toEqual(exactly(9));
    expect(page.counts.matched).toEqual({ kind: "unknown" });
    expect(page.more).toBeNull();
  });
});
