import { describe, expect, it } from "vitest";
import type { DisplayField } from "../common/index.js";
import areColumnScopesEqual from "./areColumnScopesEqual.js";

const image: DisplayField = { id: "image", header: "Image" };

describe("areColumnScopesEqual", () => {
  it("reads the columns, their fields and the types they narrow to", () => {
    expect(areColumnScopesEqual([image], [{ ...image }])).toBe(true);
    expect(areColumnScopesEqual([image], [{ ...image, field: "name" }])).toBe(
      false,
    );
    expect(areColumnScopesEqual([image], [{ ...image, id: "picture" }])).toBe(
      false,
    );
    const scoped = { ...image, appliesTo: ["container"] };
    expect(areColumnScopesEqual([scoped], [{ ...scoped }])).toBe(true);
    expect(areColumnScopesEqual([scoped], [image])).toBe(false);
    expect(
      areColumnScopesEqual([scoped], [{ ...image, appliesTo: ["vm"] }]),
    ).toBe(false);
    expect(areColumnScopesEqual([image], [image, image])).toBe(false);
  });

  it("reads nothing else: a heading or a cell rebuilt inline is the same scope", () => {
    expect(
      areColumnScopesEqual(
        [{ ...image, cell: () => null }],
        [{ ...image, header: "Picture", cell: () => null }],
      ),
    ).toBe(true);
  });
});
