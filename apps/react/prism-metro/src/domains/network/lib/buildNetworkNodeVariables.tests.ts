// @vitest-environment node

import { describe, expect, it } from "vitest";
import buildNetworkNodeVariables from "./buildNetworkNodeVariables.js";

const NAMESPACES = [
  { prefix: "metro", namespace: "https://metro.example/onto#" },
];

describe("buildNetworkNodeVariables", () => {
  it("expands a compact address through the graph's namespaces", () => {
    expect(buildNetworkNodeVariables("metro:northgate", NAMESPACES)).toEqual({
      id: "https://metro.example/onto#northgate",
    });
  });

  it("passes an absolute address through", () => {
    expect(
      buildNetworkNodeVariables("https://metro.example/onto#x", NAMESPACES),
    ).toEqual({ id: "https://metro.example/onto#x" });
  });
});
