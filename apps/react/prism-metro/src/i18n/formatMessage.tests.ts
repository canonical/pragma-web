import { describe, expect, it } from "vitest";
import formatMessage from "./formatMessage.js";

describe("formatMessage", () => {
  it("fills every placeholder the message names", () => {
    expect(formatMessage("fleet.range", { min: "60 m", max: "120 m" })).toBe(
      "60 m to 120 m",
    );
  });

  it("leaves a message with no values as the catalog writes it", () => {
    expect(formatMessage("lens.fleet", {})).toBe("Fleet");
  });
});
