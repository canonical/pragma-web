import { describe, expect, it } from "vitest";
import { MESSAGES } from "./constants.js";
import { t } from "./t.js";

describe("t", () => {
  it("reads a message without placeholders as written", () => {
    expect(t("canvasSkipLink.label")).toBe(MESSAGES["canvasSkipLink.label"]);
  });

  it("fills every placeholder from the values", () => {
    expect(t("chip.legend.kind.label", { label: "Term", shape: "leaf" })).toBe(
      "Term (leaf)",
    );
  });

  it("throws when a placeholder has no value", () => {
    expect(() => t("chip.legend.namespace.label")).toThrow(
      't: message "chip.legend.namespace.label" needs a value for {prefix}',
    );
  });
});
