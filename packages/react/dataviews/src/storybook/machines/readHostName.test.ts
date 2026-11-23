import { describe, expect, it } from "vitest";
import { storyMachines } from "./fixtures.js";
import readHostName from "./readHostName.js";

describe("readHostName", () => {
  it("names a machine by its host", () => {
    const [machine] = storyMachines;
    expect(readHostName(machine)).toBe(machine.name);
  });
});
