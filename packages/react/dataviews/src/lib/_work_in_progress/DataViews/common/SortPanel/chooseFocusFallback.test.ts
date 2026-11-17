import { describe, expect, it } from "vitest";
import chooseFocusFallback from "./chooseFocusFallback.js";

/** A panel listing one Remove per field, in order. */
const createPanel = (fields: readonly string[]): HTMLElement => {
  const panel = document.createElement("section");
  for (const field of fields) {
    const remove = document.createElement("button");
    remove.className = "remove";
    remove.dataset["field"] = field;
    panel.append(remove);
  }
  return panel;
};

describe("chooseFocusFallback", () => {
  it("chooses the same term's Remove while that term is still listed", () => {
    const panel = createPanel(["status", "name", "cores"]);
    expect(chooseFocusFallback(panel, { field: "name", place: 0 })).toBe(
      panel.querySelector('[data-field="name"]'),
    );
  });

  it("chooses the Remove standing where a term that left stood", () => {
    const panel = createPanel(["status", "cores"]);
    expect(chooseFocusFallback(panel, { field: "name", place: 1 })).toBe(
      panel.querySelector('[data-field="cores"]'),
    );
  });

  it("chooses the last Remove when the term stood past the end", () => {
    const panel = createPanel(["status"]);
    expect(chooseFocusFallback(panel, { field: "name", place: 2 })).toBe(
      panel.querySelector('[data-field="status"]'),
    );
  });

  it("chooses the panel itself once no term is left", () => {
    const panel = createPanel([]);
    expect(chooseFocusFallback(panel, { field: "name", place: 0 })).toBe(panel);
  });
});
