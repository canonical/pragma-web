import { DEFAULT_WINDOW, EMPTY_SLICE } from "@canonical/dataviews-core";
import { createManualSource } from "@canonical/dataviews-core/testing";
import { describe, expect, it } from "vitest";
import answerFacetValues from "./answerFacetValues.js";

describe("answerFacetValues", () => {
  it("answers the latest request with no rows and the field's values", () => {
    const manual = createManualSource<{ readonly id: string }>();
    const delivered: unknown[] = [];
    manual.source.execute(
      {
        requestId: "r1",
        slice: EMPTY_SLICE,
        window: DEFAULT_WINDOW,
        facets: [],
      },
      (delivery) => {
        delivered.push(delivery);
      },
    );
    const values = [
      { value: "eu", count: { kind: "exact", value: 2 } },
    ] as const;
    answerFacetValues(manual, "region", values);
    expect(delivered).toMatchObject([
      {
        status: "succeeded",
        page: { rows: [], facets: { region: { kind: "values", values } } },
      },
    ]);
  });
});
