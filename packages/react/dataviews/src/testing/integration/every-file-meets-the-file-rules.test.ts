import path from "node:path";
import { listFileRuleFindings } from "@canonical/dataviews-core/testing";
import { describe, expect, it } from "vitest";

describe("every file meets the file rules", () => {
  it("finds nothing", () => {
    // Resolved from the package root, where the suite runs.
    expect(listFileRuleFindings(path.resolve("."))).toEqual([]);
  });
});
