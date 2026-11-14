import { describe, expectTypeOf, it } from "vitest";
import type {
  EntryProps,
  QueryChipProps as Props,
  SegmentProps,
} from "./types.js";

/** Type-level tests, enforced by `tsc --noEmit`. */
describe("QueryChip props", () => {
  it("names the remove control on either route", () => {
    expectTypeOf<{
      children: "x";
      onRemove: () => void;
      removeLabel: "Remove";
    }>().toExtend<Props>();
    expectTypeOf<{
      children: "x";
      removeHref: "?";
      removeLabel: "Remove";
    }>().toExtend<Props>();
  });

  it("refuses a remove control with no name, and a name with no control", () => {
    // @ts-expect-error onRemove needs removeLabel.
    const unnamed: Props = { children: "x", onRemove: () => {} };
    // @ts-expect-error removeHref needs removeLabel.
    const unnamedLink: Props = { children: "x", removeHref: "?" };
    // @ts-expect-error removeLabel names nothing without a route.
    const label: Props = { children: "x", removeLabel: "Remove" };
    expectTypeOf(unnamed).toEqualTypeOf<Props>();
    expectTypeOf(unnamedLink).toEqualTypeOf<Props>();
    expectTypeOf(label).toEqualTypeOf<Props>();
  });

  it("accepts the span's native props", () => {
    expectTypeOf<{
      children: "x";
      id: "chip";
      title: "A clause";
    }>().toExtend<Props>();
  });
});

describe("QueryChip.Segment props", () => {
  it("requires a description on a segment at fault", () => {
    expectTypeOf<{
      children: "x";
      invalid: true;
      description: "Invalid: …";
    }>().toExtend<SegmentProps>();
    // @ts-expect-error a fault needs its description.
    const silent: SegmentProps = { children: "x", invalid: true };
    expectTypeOf(silent).toEqualTypeOf<SegmentProps>();
  });

  it("takes only the Condition values", () => {
    // @ts-expect-error "equals" is not a Condition value.
    const wrong: SegmentProps = { children: "=", condition: "equals" };
    expectTypeOf(wrong).toEqualTypeOf<SegmentProps>();
  });
});

describe("QueryChip.Entry props", () => {
  it("requires its value, its change handler and its label", () => {
    expectTypeOf<{
      value: "";
      onValueChange: (value: string) => void;
      label: "Value";
    }>().toExtend<EntryProps>();
    // @ts-expect-error an entry needs an accessible name.
    const unnamed: EntryProps = { value: "", onValueChange: () => {} };
    expectTypeOf(unnamed).toEqualTypeOf<EntryProps>();
  });
});
