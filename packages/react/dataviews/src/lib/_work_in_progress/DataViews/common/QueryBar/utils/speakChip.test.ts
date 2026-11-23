import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import { machines } from "../../../../../../../testing/index.js";
import readLabelsStandIn from "./readLabelsStandIn.js";
import speakChip from "./speakChip.js";

const labels = readLabelsStandIn();
const messages = resolveMessages();
const { schema } = machines;

describe("speakChip", () => {
  it("speaks a conjunct, a range, the search and a refusal", () => {
    const status = {
      field: "status",
      operator: "isAny",
      operands: ["running"],
    } as const;
    expect(
      speakChip(
        {
          kind: "predicate",
          id: "status__isAny__0",
          refs: [{ field: "status", operator: "isAny", nth: 0 }],
          predicate: status,
          condition: "inclusion",
        },
        schema,
        labels,
        messages,
      ),
    ).toBe("status is running");
    expect(
      speakChip(
        {
          kind: "range",
          id: "cores__range",
          field: "cores",
          refs: [
            { field: "cores", operator: "gte", nth: 0 },
            { field: "cores", operator: "lte", nth: 0 },
          ],
          lower: { field: "cores", operator: "gte", operands: [2] },
          upper: { field: "cores", operator: "lte", operands: [8] },
          condition: "range",
        },
        schema,
        labels,
        messages,
      ),
    ).toBe("cores at least 2 and at most 8");
    expect(
      speakChip(
        { kind: "search", id: "search", refs: [], search: "alder" },
        schema,
        labels,
        messages,
      ),
    ).toBe("Search for alder");
    expect(
      speakChip(
        {
          kind: "refused",
          id: "refused__status",
          refs: [],
          issue: {
            parameter: "status",
            field: "status",
            reason: "unknown option",
          } as never,
        },
        schema,
        labels,
        messages,
      ),
    ).toBe("status");
  });
});
