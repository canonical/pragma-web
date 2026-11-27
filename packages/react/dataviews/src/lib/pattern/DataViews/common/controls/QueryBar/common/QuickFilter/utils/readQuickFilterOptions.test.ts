import type { Predicate } from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import type { PlacedConjunct } from "../../../types.js";
import readQuickFilterOptions from "./readQuickFilterOptions.js";

const place = (predicate: Predicate, nth = 0): PlacedConjunct => ({
  predicate,
  ref: { field: predicate.field, operator: predicate.operator, nth },
});

const ready = place({
  field: "status",
  operator: "isAny",
  operands: ["ready"],
});
const notBroken = place({
  field: "status",
  operator: "isNone",
  operands: ["broken"],
});

const read = (multiple: boolean, conjuncts: readonly PlacedConjunct[]) =>
  readQuickFilterOptions({
    field: "status",
    options: ["deployed", "ready"],
    multiple,
    conjuncts,
    allLabel: "All",
  });

describe("readQuickFilterOptions", () => {
  describe("one value at a time", () => {
    it("leads with All, current while the field holds nothing", () => {
      expect(read(false, [])).toEqual([
        {
          value: null,
          label: "All",
          current: true,
          excluded: false,
          // Choosing All again changes nothing.
          edit: null,
        },
        {
          value: "deployed",
          label: "deployed",
          current: false,
          excluded: false,
          edit: {
            remove: [],
            add: [
              { field: "status", operator: "isAny", operands: ["deployed"] },
            ],
          },
        },
        {
          value: "ready",
          label: "ready",
          current: false,
          excluded: false,
          edit: {
            remove: [],
            add: [{ field: "status", operator: "isAny", operands: ["ready"] }],
          },
        },
      ]);
    });

    it("marks the values of the first any-of set, and replaces all the field holds", () => {
      const [all, deployed, readyWord] = read(false, [ready, notBroken]);
      expect(all).toEqual({
        value: null,
        label: "All",
        current: false,
        excluded: false,
        edit: { remove: [ready.ref, notBroken.ref], add: [] },
      });
      expect(deployed?.current).toBe(false);
      expect(deployed?.edit?.remove).toEqual([ready.ref, notBroken.ref]);
      expect(readyWord?.current).toBe(true);
    });

    it("makes no edit for the value the field holds alone", () => {
      const [, deployed, readyWord] = read(false, [ready]);
      expect(readyWord?.edit).toBeNull();
      expect(deployed?.edit).not.toBeNull();
      const pair = place({
        field: "status",
        operator: "isAny",
        operands: ["deployed", "ready"],
      });
      expect(read(false, [pair]).at(2)?.edit).not.toBeNull();
    });

    it("marks nothing from a later any-of set", () => {
      const later = place(
        { field: "status", operator: "isAny", operands: ["deployed"] },
        1,
      );
      expect(read(false, [later]).map(({ current }) => current)).toEqual([
        false,
        false,
        false,
      ]);
    });
  });

  it("marks a value a none-of set holds as excluded, and All as not current", () => {
    const [all, deployed, , broken] = readQuickFilterOptions({
      field: "status",
      options: ["deployed", "ready", "broken"],
      multiple: false,
      conjuncts: [notBroken],
      allLabel: "All",
    });
    expect(all?.current).toBe(false);
    expect(deployed?.excluded).toBe(false);
    expect(broken).toMatchObject({ excluded: true, current: false });
  });

  describe("several at once", () => {
    it("lifts an exclusion as it includes the excluded value, in one edit", () => {
      const twoExcluded = place({
        field: "status",
        operator: "isNone",
        operands: ["broken", "ready"],
      });
      const [, readyWord] = read(true, [twoExcluded]);
      expect(readyWord).toMatchObject({ excluded: true, current: false });
      expect(readyWord?.edit).toEqual({
        remove: [twoExcluded.ref],
        add: [
          { field: "status", operator: "isAny", operands: ["ready"] },
          { field: "status", operator: "isNone", operands: ["broken"] },
        ],
      });
      const onlyBroken = place({
        field: "status",
        operator: "isNone",
        operands: ["deployed"],
      });
      expect(read(true, [onlyBroken]).at(0)?.edit).toEqual({
        remove: [onlyBroken.ref],
        add: [{ field: "status", operator: "isAny", operands: ["deployed"] }],
      });
    });

    it("adds a value to a new set where the field holds none", () => {
      expect(read(true, [])).toEqual([
        {
          value: "deployed",
          label: "deployed",
          current: false,
          excluded: false,
          edit: {
            remove: [],
            add: [
              { field: "status", operator: "isAny", operands: ["deployed"] },
            ],
          },
        },
        {
          value: "ready",
          label: "ready",
          current: false,
          excluded: false,
          edit: {
            remove: [],
            add: [{ field: "status", operator: "isAny", operands: ["ready"] }],
          },
        },
      ]);
    });

    it("toggles a value in the first set, which goes once empty", () => {
      const [deployed, readyWord] = read(true, [ready, notBroken]);
      expect(deployed).toEqual({
        value: "deployed",
        label: "deployed",
        current: false,
        excluded: false,
        edit: {
          remove: [ready.ref],
          add: [
            {
              field: "status",
              operator: "isAny",
              operands: ["ready", "deployed"],
            },
          ],
        },
      });
      expect(readyWord).toEqual({
        value: "ready",
        label: "ready",
        current: true,
        excluded: false,
        edit: { remove: [ready.ref], add: [] },
      });
    });
  });
});
