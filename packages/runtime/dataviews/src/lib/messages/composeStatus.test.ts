import { describe, expect, it } from "vitest";
import composeStatus from "./composeStatus.js";

describe("composeStatus", () => {
  it("runs the statement on into the reason, ending in one stop", () => {
    expect(composeStatus("Not loaded", "offline.")).toBe(
      "Not loaded: offline.",
    );
  });

  it("says the plain statement for a blank reason", () => {
    expect(composeStatus("Not loaded", " . ")).toBe("Not loaded.");
    expect(composeStatus("Not loaded", "")).toBe("Not loaded.");
  });
});
