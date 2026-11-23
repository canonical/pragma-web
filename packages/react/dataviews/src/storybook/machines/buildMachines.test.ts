import { describe, expect, it } from "vitest";
import buildMachines from "./buildMachines.js";
import { storyMachines } from "./fixtures.js";

describe("buildMachines", () => {
  it("numbers each host, cycling through the twelve", () => {
    const [first] = storyMachines;
    const many = buildMachines(13);
    expect(many).toHaveLength(13);
    expect(many.at(0)).toMatchObject({
      id: "n-0",
      name: "node-00000.example.com",
      status: first.status,
    });
    expect(many.at(12)?.region).toBe(first.region);
  });
});
