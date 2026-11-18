import { GRAPH_BUDGET } from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import { FOUR_NAMESPACE_GRAPH } from "../../../../testing/fixtures.js";
import layOutClassGraph from "../../classGraph/layOutClassGraph.js";
import describeGraphTask from "./describeGraphTask.js";

const resting = layOutClassGraph(FOUR_NAMESPACE_GRAPH, {
  budget: GRAPH_BUDGET,
});

describe("describeGraphTask", () => {
  it("states the overview's set: every drawn namespace, in packing order", () => {
    expect(describeGraphTask(resting, undefined)).toEqual({
      "data-task": "shape",
      "data-set": resting.regions.map((region) => region.prefix).join(" "),
    });
    expect(resting.regions.length).toBeGreaterThan(1);
  });

  it("states an opened view's set: the opened namespace", () => {
    const opened = layOutClassGraph(FOUR_NAMESPACE_GRAPH, {
      budget: GRAPH_BUDGET,
      drill: "surface",
    });
    expect(describeGraphTask(opened, undefined)).toEqual({
      "data-task": "shape",
      "data-set": "surface",
    });
  });

  it("states a term page's focus: the selected class", () => {
    expect(describeGraphTask(resting, "ds:Component")).toEqual({
      "data-task": "neighbourhood",
      "data-focus": "ds:Component",
    });
  });
});
