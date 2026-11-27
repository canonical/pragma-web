import { describe, expect, it } from "vitest";
import countRows from "./countRows.js";

describe("countRows", () => {
  it("counts every row but the header's", () => {
    const canvas = document.createElement("div");
    canvas.innerHTML =
      "<table><thead><tr><th>Host</th></tr></thead><tbody><tr><td>a</td></tr><tr><td>b</td></tr></tbody></table>";
    expect(countRows(canvas)).toBe(2);
  });
});
