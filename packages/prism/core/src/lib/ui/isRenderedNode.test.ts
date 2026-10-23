import { createElement } from "react";
import { describe, expect, it } from "vitest";
import isRenderedNode from "./isRenderedNode.js";

describe("isRenderedNode", () => {
  it.each([
    ["null", null],
    ["undefined", undefined],
    ["false", false],
    ["true", true],
    ["the empty string", ""],
  ])("treats %s as rendering nothing", (_name, node) => {
    expect(isRenderedNode(node)).toBe(false);
  });

  it.each([
    ["an element", createElement("p", { key: "p" })],
    ["text", "Details"],
    ["zero, which React renders", 0],
    ["a list", [createElement("p", { key: "a" })]],
  ])("treats %s as rendering something", (_name, node) => {
    expect(isRenderedNode(node)).toBe(true);
  });
});
