import { describe, expect, it } from "vitest";
import { machines } from "./fixtures.js";
import hostName from "./hostName.js";

describe("hostName", () => {
  it("names a machine by its host", () => {
    expect(hostName(machines[0])).toBe(machines[0].name);
  });
});
