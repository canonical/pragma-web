import { describe, expect, it } from "vitest";
import type { DisplayField } from "../common/index.js";
import areFieldScopesEqual from "./areFieldScopesEqual.js";

const image: DisplayField = { id: "image", header: "Image" };

describe("areFieldScopesEqual", () => {
  it("reads the columns, their fields and the types they narrow to", () => {
    expect(areFieldScopesEqual([image], [{ ...image }])).toBe(true);
    expect(areFieldScopesEqual([image], [{ ...image, field: "name" }])).toBe(
      false,
    );
    expect(areFieldScopesEqual([image], [{ ...image, id: "picture" }])).toBe(
      false,
    );
    const scoped = { ...image, appliesTo: ["container"] };
    expect(areFieldScopesEqual([scoped], [{ ...scoped }])).toBe(true);
    expect(areFieldScopesEqual([scoped], [image])).toBe(false);
    expect(
      areFieldScopesEqual([scoped], [{ ...image, appliesTo: ["vm"] }]),
    ).toBe(false);
    expect(areFieldScopesEqual([image], [image, image])).toBe(false);
  });

  it("reads nothing else: a heading or a cell rebuilt inline is the same scope", () => {
    expect(
      areFieldScopesEqual(
        [{ ...image, cell: () => null }],
        [{ ...image, header: "Picture", cell: () => null }],
      ),
    ).toBe(true);
  });
});
