import { describe, expect, it } from "vitest";
import machine from "./machine.js";

describe("machine", () => {
  it("is a running four-core machine unless told otherwise", () => {
    expect(machine("m-1", "alpha")).toEqual({
      id: "m-1",
      name: "alpha",
      status: "running",
      cores: 4,
    });
    expect(machine("m-2", "beta", "failed", 8)).toMatchObject({
      status: "failed",
      cores: 8,
    });
  });
});
