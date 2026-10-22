import { describe, expect, it } from "vitest";
import {
  NO_NODE_SDL,
  NODE_SDL,
  NON_OBJECT_SDL,
} from "../../../testing/fixtures.js";
import assertBindings from "./assertBindings.js";

const station = {
  id: "station",
  classUri: "metro:Station",
  typename: "Station",
} as const;

describe("assertBindings", () => {
  it("accepts bindings whose types implement Node, across extensions", () => {
    expect(() => assertBindings(NODE_SDL, [station])).not.toThrow();
  });

  it("accepts an empty set of bindings", () => {
    expect(() => assertBindings(NODE_SDL, [])).not.toThrow();
  });

  it("throws when a binding names a type the schema does not declare", () => {
    expect(() =>
      assertBindings(NODE_SDL, [
        { ...station, id: "depot", typename: "Depot" },
      ]),
    ).toThrow(
      'assertBindings: binding "depot" names type "Depot", which the schema does not declare',
    );
  });

  it.each(["Thing", "Stop", "Place", "Zone", "Instant"])(
    "throws when a binding names %s, declared but not as an object type",
    (typename) => {
      // No node ever carries an interface's, an input's, a union's, an
      // enum's or a scalar's name as its `__typename`, so the schema does
      // not declare a bindable type by that name.
      expect(() =>
        assertBindings(NON_OBJECT_SDL, [{ ...station, id: "probe", typename }]),
      ).toThrow(
        `assertBindings: binding "probe" names type "${typename}", which the schema does not declare`,
      );
    },
  );

  it("throws when a binding's type does not implement Node", () => {
    expect(() =>
      assertBindings(NODE_SDL, [{ ...station, id: "line", typename: "Line" }]),
    ).toThrow(
      'assertBindings: binding "line" names type "Line", which does not implement Node',
    );
    expect(() => assertBindings(NO_NODE_SDL, [station])).toThrow(
      "which does not implement Node",
    );
  });

  it("throws when two bindings share an id", () => {
    expect(() => assertBindings(NODE_SDL, [station, station])).toThrow(
      'assertBindings: binding "station" is declared twice',
    );
  });

  it("throws when the SDL does not parse", () => {
    expect(() => assertBindings("type {", [station])).toThrow(/Syntax Error/);
  });
});
