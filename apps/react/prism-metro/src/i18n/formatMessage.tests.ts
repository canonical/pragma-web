// @vitest-environment node

import { describe, expect, it } from "vitest";
import formatMessage from "./formatMessage.js";

describe("formatMessage", () => {
  it("fills each placeholder with its value", () => {
    expect(formatMessage("network.station.minutes", { minutes: 4 })).toBe(
      "4 min",
    );
  });

  it("returns a message with no placeholder as it is", () => {
    expect(formatMessage("lens.network", {})).toBe("Network");
  });

  it("throws on a placeholder with no value", () => {
    expect(() => formatMessage("network.placeholder", {})).toThrow(
      /\{component\}/,
    );
  });
});
