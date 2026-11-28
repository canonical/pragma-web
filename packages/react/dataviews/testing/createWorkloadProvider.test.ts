import { describe, expect, it, onTestFinished } from "vitest";
import { workloadCollection } from "../src/storybook/workloads/index.js";
import createWorkloadProvider from "./createWorkloadProvider.js";
import elementAt from "./elementAt.js";
import { WORKLOAD_RECORDS, WORKLOAD_RETYPED } from "./fixtures.js";

describe("createWorkloadProvider", () => {
  it("answers one workload of each type by default", () => {
    const { provider } = createWorkloadProvider();
    onTestFinished(provider.observe());
    expect(provider.collection).toBe(workloadCollection);
    expect(provider.state.get().result.rows).toEqual(WORKLOAD_RECORDS);
  });

  it("answers the rows it is given, and the rows that replace them", () => {
    const web = elementAt(WORKLOAD_RECORDS, 0);
    const { provider, source } = createWorkloadProvider([web]);
    onTestFinished(provider.observe());
    expect(provider.state.get().result.rows).toEqual([web]);
    source.setRows([WORKLOAD_RETYPED]);
    provider.refresh();
    expect(provider.state.get().result.rows).toEqual([WORKLOAD_RETYPED]);
  });
});
