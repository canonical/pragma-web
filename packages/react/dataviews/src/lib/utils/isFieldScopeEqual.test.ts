/**
 * Two columns' scopes compared by what a scope reads: identity, record field
 * and narrowing, never heading or content.
 */
import { describe, expect, it } from "vitest";
import isFieldScopeEqual from "./isFieldScopeEqual.js";

describe("isFieldScopeEqual", () => {
  const column = { id: "image", header: "Image", appliesTo: ["container"] };

  it("reads a heading or content rebuilt as the same scope", () => {
    expect(
      isFieldScopeEqual(column, {
        ...column,
        header: "Container image",
        appliesTo: ["container"],
        cell: () => null,
      }),
    ).toBe(true);
  });

  it("tells apart the identity, the field and the narrowing", () => {
    expect(isFieldScopeEqual(column, { ...column, id: "other" })).toBe(false);
    expect(isFieldScopeEqual(column, { ...column, field: "name" })).toBe(false);
    expect(isFieldScopeEqual(column, { ...column, appliesTo: [] })).toBe(false);
    const { appliesTo: _, ...unscoped } = column;
    expect(isFieldScopeEqual(column, unscoped)).toBe(false);
    expect(isFieldScopeEqual(unscoped, { ...unscoped })).toBe(true);
  });
});
