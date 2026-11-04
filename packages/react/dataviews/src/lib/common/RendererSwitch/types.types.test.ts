import type { DataViewsMessages } from "@canonical/dataviews-core";
import type { ReactNode } from "react";
import { describe, expectTypeOf, it } from "vitest";
import type { RendererChoice, RendererSwitchProps } from "./types.js";

describe("RendererChoice", () => {
  it("names a renderer, identifies it and holds what it draws", () => {
    expectTypeOf<RendererChoice>().toEqualTypeOf<{
      readonly id: string;
      readonly label: string;
      readonly content: ReactNode;
    }>();
  });
});

describe("RendererSwitchProps", () => {
  it("requires the renderers and leaves the name and the words optional", () => {
    expectTypeOf<RendererSwitchProps["renderers"]>().toEqualTypeOf<
      readonly RendererChoice[]
    >();
    expectTypeOf<RendererSwitchProps["label"]>().toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf<RendererSwitchProps["messages"]>().toEqualTypeOf<
      Partial<DataViewsMessages> | undefined
    >();
  });

  it("extends native section props, less the ones the switch sets itself", () => {
    expectTypeOf<RendererSwitchProps>().toHaveProperty("className");
    expectTypeOf<RendererSwitchProps>().not.toHaveProperty("children");
    expectTypeOf<RendererSwitchProps>().not.toHaveProperty("aria-label");
    expectTypeOf<RendererSwitchProps>().not.toHaveProperty("aria-labelledby");
  });
});
