import { describe, expect, it } from "vitest";
import buildFleet from "./buildFleet.js";

describe("buildFleet", () => {
  it("numbers each machine from one, every third failed, its cores its number", () => {
    const fleet = buildFleet(3);
    expect(fleet.map(({ id }) => id)).toEqual(["m-001", "m-002", "m-003"]);
    expect(fleet.map(({ status }) => status)).toEqual([
      "running",
      "running",
      "failed",
    ]);
    expect(fleet[2]).toMatchObject({ name: "host-003", cores: 3 });
  });
});
