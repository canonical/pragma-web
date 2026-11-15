import { describe, expect, it } from "vitest";
import buildMachine from "./buildMachine.js";

describe("buildMachine", () => {
  it("is a running four-core machine unless told otherwise", () => {
    expect(buildMachine("m-1", "alpha")).toEqual({
      id: "m-1",
      name: "alpha",
      status: "running",
      cores: 4,
    });
    expect(buildMachine("m-2", "beta", "failed", 8)).toMatchObject({
      status: "failed",
      cores: 8,
    });
  });
});
