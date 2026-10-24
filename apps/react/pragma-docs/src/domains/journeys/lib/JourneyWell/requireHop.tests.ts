import { describe, expect, it } from "vitest";
import requireHop from "./requireHop.js";
import type { JourneyGraphNode } from "./types.js";

const HOP: JourneyGraphNode = {
  id: "job:read",
  x: 0,
  y: 0,
  width: 176,
  height: 44,
  data: { uri: "job:read", label: "Read a standard", kind: "job" },
};

describe("requireHop", () => {
  it("reads a placed hop by its id", () => {
    expect(requireHop(new Map([[HOP.id, HOP]]), HOP.id)).toBe(HOP);
  });

  it("fails at the invariant when an edge names a hop never placed", () => {
    expect(() => requireHop(new Map(), "job:missing")).toThrow(
      "the journey layout connects job:missing, which it never placed",
    );
  });
});
