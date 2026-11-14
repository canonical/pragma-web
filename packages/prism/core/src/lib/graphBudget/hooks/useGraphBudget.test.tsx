import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GRAPH_BUDGET } from "../constants.js";
import useGraphBudget from "./useGraphBudget.js";

describe("useGraphBudget", () => {
  it("reads the defaults when no provider is mounted", () => {
    expect(renderHook(() => useGraphBudget()).result.current).toBe(
      GRAPH_BUDGET,
    );
  });
});
