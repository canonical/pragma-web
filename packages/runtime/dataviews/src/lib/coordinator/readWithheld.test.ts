import { describe, expect, it } from "vitest";
import type { QueryIssue } from "../result/index.js";
import createQueryCoordinator from "./createQueryCoordinator.js";
import readWithheld from "./readWithheld.js";

const melted: QueryIssue = {
  parameter: "status",
  field: "status",
  code: "invalid",
  reason: '"melted" is not an option',
};

describe("readWithheld", () => {
  it("reads the link's refused clauses a withheld query stands on", () => {
    const coordinator = createQueryCoordinator({ withheld: [melted] });
    expect(readWithheld(coordinator.state)).toEqual([melted]);
  });

  it("reads none for a query that runs, or one the source refused", () => {
    const coordinator = createQueryCoordinator();
    expect(readWithheld(coordinator.state)).toEqual([]);
    coordinator.complete(coordinator.refresh(), {
      status: "refused",
      refusals: [
        {
          part: "sort",
          code: "too-many-terms",
          field: null,
          operator: null,
          reason: "one term at most",
        },
      ],
    });
    expect(readWithheld(coordinator.state)).toEqual([]);
  });
});
