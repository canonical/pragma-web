import { describe, expect, it } from "vitest";
import acceptColour from "./acceptColour.js";

describe("acceptColour", () => {
  it("accepts the hex colours the metro's lines hold", () => {
    for (const colour of ["#f2b705", "#C8102E", "#000", "#0072ce80", "#fff8"]) {
      expect(acceptColour(colour)).toBe(colour);
    }
  });

  it("accepts the colour functions the design tokens hold", () => {
    for (const colour of [
      "oklch(100% 0.0131 23.19)",
      "oklch(0% 0 0 / 0.15)",
      "rgb(255, 255, 255)",
      "hsl(0 0% 15%)",
    ]) {
      expect(acceptColour(colour)).toBe(colour);
    }
  });

  it("refuses a value that would add declarations or fetch a resource", () => {
    for (const colour of [
      "red;position:fixed;inset:0;background:url(//host/x.png)",
      "#fff;position:fixed",
      "url(//host/x.png)",
      "var(--color-text-default)",
      "rgb(var(--x))",
      "oklch(50% 0.1 20);inset:0",
      "rgb(1 2 3) url(//host/x.png)",
      "red",
      "#ggg",
      "",
    ]) {
      expect(acceptColour(colour)).toBeUndefined();
    }
  });
});
