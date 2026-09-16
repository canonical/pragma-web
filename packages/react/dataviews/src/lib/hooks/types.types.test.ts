/**
 * The hooks' own types: what the cell hook answers, what the render ceiling
 * takes, and the renderer name the scopes and the ceiling share.
 */
import { describe, expectTypeOf, it } from "vitest";
import type { ReadFieldScopesConfig, RendererName } from "../utils/types.js";
import type {
  UseDataViewsCellResult,
  UseFieldScopesProps,
  UseRenderCeilingProps,
} from "./types.js";

describe("UseDataViewsCellResult", () => {
  it("carries no applicability, which is the content's prop", () => {
    expectTypeOf<UseDataViewsCellResult>().not.toHaveProperty("applicability");
  });
});

describe("UseRenderCeilingProps", () => {
  it("takes the renderer, the count and whether it virtualizes, and no words", () => {
    expectTypeOf<
      UseRenderCeilingProps["renderer"]
    >().toEqualTypeOf<RendererName>();
    expectTypeOf<UseRenderCeilingProps>().not.toHaveProperty("unit");
    expectTypeOf<UseRenderCeilingProps>().not.toHaveProperty("virtualization");
  });
});

describe("UseFieldScopesProps", () => {
  it("is the scope reader's config", () => {
    expectTypeOf<UseFieldScopesProps>().toEqualTypeOf<ReadFieldScopesConfig>();
  });
});
