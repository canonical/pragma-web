/**
 * Whether a field applies to a cell's record reached content two ways: as a
 * prop, and again through the cell hook, from the cell context both were
 * installed from, though it never changes for the cell's life.
 *
 * It is a prop alone; the hook and the context carry the row's channels.
 */
import { describe, expectTypeOf, it } from "vitest";
import type { CellContextValue } from "../../lib/common/index.js";
import type { UseDataViewsCellResult } from "../../lib/hooks/index.js";

describe("a cell's applicability", () => {
  it("is not read through the cell hook or its context", () => {
    expectTypeOf<UseDataViewsCellResult>().not.toHaveProperty("applicability");
    expectTypeOf<CellContextValue>().not.toHaveProperty("applicability");
  });
});
