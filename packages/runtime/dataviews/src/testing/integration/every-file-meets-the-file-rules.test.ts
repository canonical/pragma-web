import path from "node:path";
import { describe, expect, it } from "vitest";
import { FILE_RULE_ALLOWLIST } from "../../../testing/constants.js";
import listFileRuleFindings from "../../../testing/listFileRuleFindings.js";

describe("every file meets the file rules", () => {
  it("finds exactly the findings the allowlist records", () => {
    // Resolved from the package root, where the suite runs.
    expect(listFileRuleFindings(path.resolve("."))).toEqual(
      [...FILE_RULE_ALLOWLIST].sort(),
    );
  });
});
