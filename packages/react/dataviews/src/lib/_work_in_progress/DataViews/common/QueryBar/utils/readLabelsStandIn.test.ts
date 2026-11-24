import { describe, expect, it } from "vitest";
import readLabelsStandIn from "./readLabelsStandIn.js";

describe("readLabelsStandIn", () => {
  it("names a field by itself and the records as records", () => {
    const labels = readLabelsStandIn();
    expect(labels.readFieldLabel("status")).toBe("status");
    expect(labels.recordNoun).toEqual({
      singular: "record",
      plural: "records",
    });
    // One answer, so a reader's identity holds across renders.
    expect(readLabelsStandIn().recordNoun).toBe(labels.recordNoun);
  });
});
