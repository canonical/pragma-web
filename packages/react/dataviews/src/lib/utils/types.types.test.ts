/**
 * The scope reader's config and answer: the collection, the fields and the
 * renderer that names them, answered per type.
 */
import type { Applicability } from "@canonical/dataviews-core";
import { describe, expectTypeOf, it } from "vitest";
import type {
  FieldScope,
  ReadFieldScopesConfig,
  RendererName,
} from "./types.js";

describe("ReadFieldScopesConfig", () => {
  it("reads the collection, the fields and the renderer's name", () => {
    expectTypeOf<keyof ReadFieldScopesConfig>().toEqualTypeOf<
      "collection" | "fields" | "renderer"
    >();
    expectTypeOf<
      ReadFieldScopesConfig["renderer"]
    >().toEqualTypeOf<RendererName>();
  });
});

describe("FieldScope", () => {
  it("answers whether it applies for a type", () => {
    expectTypeOf<FieldScope["applicability"]>().toEqualTypeOf<
      (type: string | null) => Applicability
    >();
  });
});
