import { describe, expect, it } from "vitest";
import buildSelfLoop from "./buildSelfLoop.js";

describe("buildSelfLoop", () => {
  it("loops off the box's east side, labelled beyond the loop", () => {
    const loop = buildSelfLoop({ x: 100, y: 50, width: 40, height: 20 });
    expect(loop.d).toBe("M 116 42 C 172 6, 172 86, 118 60");
    expect(loop.labelAt).toEqual({ x: 176, y: 50 });
  });
});
