import { describe, expect, it, vi } from "vitest";
import {
  expectSwitchCoverage,
  type SwitchFragment,
} from "../../../testing/index.js";

/**
 * Build a switch's compiled fragment on `Node`: its default spreads on
 * `Node`, then one aliased spread per type in `armed`, and an inline
 * fragment on each type in `inline`.
 */
const buildFragment = (
  armed: readonly string[],
  inline: readonly string[] = [],
): SwitchFragment => ({
  name: "ProbeProjection_node",
  type: "Node",
  selections: [
    { kind: "ScalarField" },
    ...["Node", ...armed].map((type) => ({
      kind: "AliasedInlineFragmentSpread",
      fragment: { type },
    })),
    ...inline.map((type) => ({ kind: "InlineFragment", type })),
  ],
});

describe("expectSwitchCoverage", () => {
  it("renders one node per type condition, its default left out", () => {
    const render = vi.fn();
    expectSwitchCoverage({
      fragment: buildFragment(["Station", "Line"], ["Train"]),
      cases: { Line: "line", Station: "station", Train: "train" },
      render,
    });
    expect(render.mock.calls).toEqual([
      ["Line", "line"],
      ["Station", "station"],
      ["Train", "train"],
    ]);
  });

  it("reads no condition from an aliased spread that carries no type", () => {
    const render = vi.fn();
    const fragment = buildFragment(["Station"]);
    expectSwitchCoverage({
      fragment: {
        ...fragment,
        selections: [
          ...fragment.selections,
          { kind: "AliasedInlineFragmentSpread", fragment: null },
        ],
      },
      cases: { Station: "station" },
      render,
    });
    expect(render.mock.calls).toEqual([["Station", "station"]]);
  });

  it("fails on a type condition the cases do not name", () => {
    expect(() =>
      expectSwitchCoverage({
        fragment: buildFragment(["Station", "Line"]),
        cases: { Station: "station" },
        render: () => {},
      }),
    ).toThrow(
      "ProbeProjection_node spreads an arm on Line but the coverage names no case for it",
    );
  });

  it("fails on a case the fragment has no type condition for", () => {
    expect(() =>
      expectSwitchCoverage({
        fragment: buildFragment(["Station"]),
        cases: { Station: "station", Depot: "depot" },
        render: () => {},
      }),
    ).toThrow(
      "ProbeProjection_node has no type condition Depot: the case names no arm the switch spreads",
    );
  });

  it("fails on a case that holds no node", () => {
    expect(() =>
      expectSwitchCoverage({
        fragment: buildFragment(["Station"]),
        cases: { Station: undefined },
        render: () => {},
      }),
    ).toThrow("the case Station holds no node");
  });

  it("passes the render's own failure on", () => {
    expect(() =>
      expectSwitchCoverage({
        fragment: buildFragment(["Station"]),
        cases: { Station: "station" },
        render: () => {
          throw new Error("the Station arm did not render");
        },
      }),
    ).toThrow("the Station arm did not render");
  });
});
