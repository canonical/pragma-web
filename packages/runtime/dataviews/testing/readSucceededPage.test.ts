import { describe, expect, it } from "vitest";
import buildPage from "./buildPage.js";
import readSucceededPage from "./readSucceededPage.js";

describe("readSucceededPage", () => {
  it("reads the page of a delivery that succeeded", () => {
    const page = buildPage([{ id: "a" }]);
    expect(readSucceededPage({ status: "succeeded", page })).toBe(page);
  });

  it("fails on a delivery that did not succeed", () => {
    expect(() =>
      readSucceededPage({ status: "forbidden", cause: null }),
    ).toThrow("expected a page, the delivery forbidden");
  });
});
