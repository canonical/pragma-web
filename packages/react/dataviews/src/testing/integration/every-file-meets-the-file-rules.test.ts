import path from "node:path";
import { listFileRuleFindings } from "@canonical/dataviews-core/testing";
import { describe, expect, it } from "vitest";
import { FILE_RULE_ALLOWLIST } from "../../../testing/constants.js";

describe("every file meets the file rules", () => {
  it("finds exactly the findings the allowlist records", () => {
    // Resolved from the package root, where the suite runs.
    expect(listFileRuleFindings(path.resolve("."))).toEqual(
      [...FILE_RULE_ALLOWLIST].sort(),
    );
  });
});
