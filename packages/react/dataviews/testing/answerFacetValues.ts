import { createPage } from "@canonical/dataviews-core";
import type { ManualSource } from "@canonical/dataviews-core/testing";
import { act } from "@testing-library/react";
import type { FacetValue } from "./types.js";

/**
 * Answer a manual source's latest request with no rows and one field's
 * values facet.
 *
 * @note Impure: delivers to the source, inside `act`.
 */
export default function answerFacetValues<TRow extends object>(
  source: ManualSource<TRow>,
  field: string,
  values: readonly FacetValue[],
): void {
  act(() => {
    source.latest().deliver({
      status: "succeeded",
      page: createPage({
        rows: [],
        facets: { [field]: { kind: "values", values } },
      }),
    });
  });
}
