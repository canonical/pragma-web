import type { Ref } from "react";
import { describe, expectTypeOf, it } from "vitest";
import type Props from "./types.js";
// Like `it.fails`, at the type level: `types.ts` has no named
// `IconButtonProps` yet, so this import is an error and the name is `any`.
// Once the named export lands, this directive becomes unused and fails the
// check, and the `toBeAny` below must become `toEqualTypeOf<Props>()`.
// @ts-expect-error IconButtonProps is not a named export of types.ts yet.
import type { IconButtonProps } from "./types.js";

/**
 * Type-level tests for IconButton's props.
 *
 * Nothing here asserts at runtime: `tsc --noEmit` is the gate, and this
 * package's tsconfig includes test files, so every `@ts-expect-error` below
 * must still be an error or the check fails. The `it()` wrappers exist so
 * Vitest sees a suite.
 */
describe("IconButton props", () => {
  it("requires an accessible name", () => {
    expectTypeOf<{
      icon: "edit";
      "aria-label": "Edit";
    }>().toExtend<Props>();
    expectTypeOf<{
      icon: "edit";
      "aria-labelledby": "edit-label";
    }>().toExtend<Props>();
    // @ts-expect-error neither aria-label nor aria-labelledby is given.
    const unnamed: Props = { icon: "edit" };
    expectTypeOf(unnamed).toEqualTypeOf<Props>();
  });

  it("refuses children", () => {
    const withChildren: Props = {
      icon: "edit",
      "aria-label": "Edit",
      // @ts-expect-error an icon button has no visible children.
      children: "Edit",
    };
    expectTypeOf(withChildren).toEqualTypeOf<Props>();
  });

  it("refuses the link variant", () => {
    const asLink: Props = {
      icon: "edit",
      "aria-label": "Edit",
      // @ts-expect-error the link variant strips the square box.
      variant: "link",
    };
    expectTypeOf(asLink).toEqualTypeOf<Props>();
  });

  it("is the named IconButtonProps export", () => {
    expectTypeOf<IconButtonProps>().toBeAny();
  });

  it("accepts every native button attribute through Button", () => {
    expectTypeOf<{
      icon: "settings";
      "aria-label": "Table settings";
      type: "button";
      form: "settings-form";
      popoverTarget: "settings-panel";
      popoverTargetAction: "toggle";
      style: { marginInlineStart: 0 };
    }>().toExtend<Props>();
    expectTypeOf<Props["ref"]>().toEqualTypeOf<
      Ref<HTMLButtonElement> | undefined
    >();
  });

  it("requires an icon", () => {
    // @ts-expect-error the icon is the button's only visible content.
    const iconless: Props = { "aria-label": "Edit" };
    expectTypeOf(iconless).toEqualTypeOf<Props>();
  });
});
