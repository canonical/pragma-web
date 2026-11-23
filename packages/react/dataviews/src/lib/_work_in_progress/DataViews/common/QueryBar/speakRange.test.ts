import { createSchema } from "@canonical/dataviews-core";
import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import speakRange from "./speakRange.js";
import { readLabelsStandIn } from "./utils/index.js";

const schema = createSchema([
  {
    field: "memory",
    kind: "number",
    units: {
      base: "MiB",
      display: [
        { symbol: "MiB", factor: 1 },
        { symbol: "GiB", factor: 1024 },
      ],
    },
  },
]);

describe("speakRange", () => {
  it("speaks the lower bound with the label, then the upper, in display units", () => {
    expect(
      speakRange(
        { field: "memory", operator: "gte", operands: [8192] },
        { field: "memory", operator: "lte", operands: [65_536] },
        schema,
        readLabelsStandIn(),
        resolveMessages(),
      ),
    ).toBe("memory at least 8 GiB and at most 64 GiB");
  });
});
