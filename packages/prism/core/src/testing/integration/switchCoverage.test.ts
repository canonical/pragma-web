import { describe, expect, it, vi } from "vitest";
import {
  expectSwitchCoverage,
  guardTypedArms,
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

/** The maps a probe tree provides: one form, one typed arm, one site arm. */
const PROBE_MAPS = {
  chip: {
    Node: "NodeChip",
    types: { Station: (): string => "StationChip" },
    siteTypes: { Depot: (): string => "DepotChip" },
  },
} as const;

/** A probe tree's render: it passes its maps through `guardTypedArms`. */
const renderGuarded = (): void => {
  guardTypedArms(PROBE_MAPS);
};

describe("expectSwitchCoverage", () => {
  it("renders one node per type condition, its default left out", () => {
    const render = vi.fn(renderGuarded);
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
    const render = vi.fn(renderGuarded);
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

  it("fails on a case whose tree did not guard its maps", () => {
    expect(() =>
      expectSwitchCoverage({
        fragment: buildFragment(["Station"]),
        cases: { Station: "station" },
        render: () => {},
      }),
    ).toThrow(
      "ProbeProjection_node: the case Station rendered under maps its tree did not pass through guardTypedArms, so a typed arm in them could hide a missing case",
    );
  });
});

describe("guardTypedArms", () => {
  it("returns the maps as given outside a coverage", () => {
    expect(guardTypedArms(PROBE_MAPS)).toBe(PROBE_MAPS);
  });

  it("makes every typed and site arm throw while a case renders, the Node arm kept", () => {
    expectSwitchCoverage({
      fragment: buildFragment(["Station"]),
      cases: { Station: "station" },
      render: () => {
        const { chip } = guardTypedArms(PROBE_MAPS);
        expect(chip.Node).toBe("NodeChip");
        expect(() => chip.types.Station()).toThrow(
          "the chip map's arm for Station rendered: under a switch's coverage a node reaches its typed arm only through the switch's own case",
        );
        expect(() => chip.siteTypes.Depot()).toThrow(
          "the chip map's arm for Depot rendered",
        );
      },
    });
  });

  it("guards a map that holds no site arms", () => {
    expectSwitchCoverage({
      fragment: buildFragment(["Station"]),
      cases: { Station: "station" },
      render: () => {
        const { row } = guardTypedArms({ row: { types: { Station: 1 } } });
        expect(row).not.toHaveProperty("siteTypes");
      },
    });
  });
});
