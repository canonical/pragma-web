/**
 * The renderers a warning or an error names were written out as a union in
 * the scope reader's config and again in the render ceiling's props, so a
 * renderer added to one could be missing from the other; and the scopes
 * hook's props picked every member of the reader's config by name.
 *
 * One renderer name type serves both, and the hook takes the reader's config.
 */

import { describe, expectTypeOf, it } from "vitest";
import type {
  UseFieldScopesProps,
  UseRenderCeilingProps,
} from "../../lib/hooks/types.js";
import type {
  ReadFieldScopesConfig,
  RendererName,
} from "../../lib/utils/types.js";

describe("a renderer's name", () => {
  it("is one type, read by the scopes and the ceiling alike", () => {
    expectTypeOf<
      ReadFieldScopesConfig["renderer"]
    >().toEqualTypeOf<RendererName>();
    expectTypeOf<
      UseRenderCeilingProps["renderer"]
    >().toEqualTypeOf<RendererName>();
    expectTypeOf<UseFieldScopesProps>().toEqualTypeOf<ReadFieldScopesConfig>();
  });
});
