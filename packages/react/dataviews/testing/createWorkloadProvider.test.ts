import { describe, expect, it, onTestFinished } from "vitest";
import createWorkloadProvider from "./createWorkloadProvider.js";

describe("createWorkloadProvider", () => {
  it("answers its rows, host applying to containers alone", () => {
    const provider = createWorkloadProvider([
      { id: "w-1", type: "vm", host: "kept" },
    ]);
    onTestFinished(provider.observe());
    expect(provider.state.get().result.rows).toEqual([
      { id: "w-1", type: "vm", host: "kept" },
    ]);
    expect(
      provider.collection.schema.fields.find(({ field }) => field === "host"),
    ).toMatchObject({ appliesTo: ["container"] });
  });
});
