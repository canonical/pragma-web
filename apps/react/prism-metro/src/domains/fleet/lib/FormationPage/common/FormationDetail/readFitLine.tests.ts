import { describe, expect, it } from "vitest";
import readFitLine from "./readFitLine.js";

describe("readFitLine", () => {
  const lines = new Map([["C", { title: "Circle Line" }]]);

  it("reads the line with the fit's code", () => {
    expect(readFitLine(lines, "C")).toEqual({ title: "Circle Line" });
  });

  it("throws when no line has the code", () => {
    expect(() => readFitLine(lines, "N")).toThrow(
      "no line of the formation has the code N",
    );
  });
});
