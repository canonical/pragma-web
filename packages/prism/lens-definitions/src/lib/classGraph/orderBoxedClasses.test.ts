import { requireEntry } from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import ontologyGraph from "../../../testing/records/ontologyGraph.js";
import buildClassGraphModel from "./buildClassGraphModel.js";
import orderBoxedClasses from "./orderBoxedClasses.js";

describe("orderBoxedClasses", () => {
  const model = buildClassGraphModel(ontologyGraph);

  it("lists every class of the namespace once, a parent before its children", () => {
    const ordered = orderBoxedClasses(model, "ds");
    const ids = requireEntry(
      new Map(model.regionOrder.map(({ prefix, ids }) => [prefix, ids])),
      "ds",
    );
    expect(ordered.map(({ uri }) => uri).sort()).toEqual([...ids].sort());
    ordered.forEach(({ uri, depth }, index) => {
      const parent = model.parent.get(uri);
      if (parent === undefined) {
        expect(depth).toBe(0);
        return;
      }
      const at = ordered.findIndex((entry) => entry.uri === parent);
      expect(at).toBeLessThan(index);
      expect(depth).toBe(
        requireEntry(
          new Map(ordered.map((entry) => [entry.uri, entry.depth])),
          parent,
        ) + 1,
      );
    });
  });

  it("orders the roots and each class's children by label", () => {
    const labels = orderBoxedClasses(model, "cs").map(
      ({ uri }) => requireEntry(model.byId, uri).label,
    );
    expect(labels).toEqual(["Category", "Code Standard", "Example"]);
    expect(orderBoxedClasses(model, "absent")).toEqual([]);
  });

  it("holds a deeper class under its parent", () => {
    const ordered = orderBoxedClasses(model, "ds");
    expect(Math.max(...ordered.map(({ depth }) => depth))).toBeGreaterThan(0);
  });
});
