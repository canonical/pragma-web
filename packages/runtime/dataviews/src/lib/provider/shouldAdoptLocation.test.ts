import { describe, expect, it } from "vitest";
import { createQueryCoordinator } from "../coordinator/index.js";
import { DEFAULT_WINDOW, EMPTY_SLICE } from "../query/index.js";
import type { QueryIssue } from "../result/index.js";
import shouldAdoptLocation from "./shouldAdoptLocation.js";

const melted: QueryIssue = {
  parameter: "status",
  field: "status",
  code: "invalid",
  reason: '"melted" is not an option',
};

const standing = {
  state: createQueryCoordinator().state,
  standingView: null,
  decoded: { slice: EMPTY_SLICE, window: DEFAULT_WINDOW, issues: [] },
  view: null,
  narrowing: [],
};

describe("shouldAdoptLocation", () => {
  it("adopts nothing where the host already stands", () => {
    expect(shouldAdoptLocation(standing)).toBe(false);
  });

  it("adopts another query, another view or other narrowing clauses", () => {
    for (const moved of [
      {
        ...standing,
        decoded: {
          ...standing.decoded,
          window: { ...DEFAULT_WINDOW, page: 2 },
        },
      },
      { ...standing, view: "failed" },
      { ...standing, narrowing: [melted] },
    ]) {
      expect(shouldAdoptLocation(moved)).toBe(true);
    }
  });
});
