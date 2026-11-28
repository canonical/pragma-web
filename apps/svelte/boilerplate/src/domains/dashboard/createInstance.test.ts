import { describe, expect, it } from "vitest";
import createInstance from "./createInstance.js";

describe("createInstance", () => {
  it("builds a starting instance with the release's product name", () => {
    expect(
      createInstance({ instance_name: "web-03", release: "jammy" }),
    ).toEqual({
      name: "web-03",
      status: "starting",
      release: "Ubuntu 22.04 LTS",
      ipv4: "",
      memoryGib: 4,
    });
  });

  it("returns nothing without a name", () => {
    expect(createInstance({ instance_name: "  ", release: "noble" })).toBe(
      undefined,
    );
  });
});
