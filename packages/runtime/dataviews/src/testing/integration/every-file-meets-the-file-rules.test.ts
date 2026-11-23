import path from "node:path";
import { describe, expect, it } from "vitest";
import { listFileRuleFindings } from "../../../testing/index.js";

describe("every file meets the file rules", () => {
  it("finds nothing", () => {
    // Resolved from the package root, where the suite runs.
    expect(listFileRuleFindings(path.resolve("."))).toEqual([]);
  });
});
