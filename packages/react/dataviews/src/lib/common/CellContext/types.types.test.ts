/**
 * The cell context carries the row's channels; a cell's applicability is
 * the content's prop alone, never read through the context.
 */
import { describe, expectTypeOf, it } from "vitest";
import type { CellContextValue } from "./types.js";

describe("CellContextValue", () => {
  it("carries no applicability", () => {
    expectTypeOf<CellContextValue>().not.toHaveProperty("applicability");
  });
});
