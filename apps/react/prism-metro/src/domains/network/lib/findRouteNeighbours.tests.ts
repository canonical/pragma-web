// @vitest-environment node

import { describe, expect, it } from "vitest";
import findRouteNeighbours from "./findRouteNeighbours.js";

const LINEAR = ["a", "b", "c"];

describe("findRouteNeighbours", () => {
  it("finds the stops either side of a stop mid-route", () => {
    expect(findRouteNeighbours(LINEAR, false, "b")).toEqual({
      previous: "a",
      next: "c",
    });
  });

  it("leaves the open side of a linear route's termini empty", () => {
    expect(findRouteNeighbours(LINEAR, false, "a")).toEqual({
      previous: undefined,
      next: "b",
    });
    expect(findRouteNeighbours(LINEAR, false, "c")).toEqual({
      previous: "b",
      next: undefined,
    });
  });

  it("wraps a loop, so its first stop follows its last", () => {
    expect(findRouteNeighbours(LINEAR, true, "a")).toEqual({
      previous: "c",
      next: "b",
    });
    expect(findRouteNeighbours(LINEAR, true, "c")).toEqual({
      previous: "b",
      next: "a",
    });
  });

  it("does not wrap a loop over one stop onto itself", () => {
    expect(findRouteNeighbours(["a"], true, "a")).toEqual({
      previous: undefined,
      next: undefined,
    });
  });

  it("answers undefined for a stop the route does not call at", () => {
    expect(findRouteNeighbours(LINEAR, false, "z")).toBeUndefined();
  });
});
