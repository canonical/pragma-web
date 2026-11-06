import {
  DEFAULT_WINDOW,
  type Source,
  type SourceDelivery,
  type SourceRequest,
} from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import createUncountedSource from "./createUncountedSource.js";
import type { Machine } from "./types.js";

const request: SourceRequest = {
  requestId: "r-1",
  slice: { filter: [], search: null, sort: [], group: [] },
  window: DEFAULT_WINDOW,
  facets: [],
};

/** Every delivery one execution makes, in order. */
const deliveries = (
  source: Source<Machine>,
): readonly SourceDelivery<Machine>[] => {
  const delivered: SourceDelivery<Machine>[] = [];
  source.execute(request, (delivery) => {
    delivered.push(delivery);
  });
  return delivered;
};

describe("createUncountedSource", () => {
  it("declares no count, and answers none", () => {
    const source = createUncountedSource();
    expect(source.capabilities.counts).toEqual({
      pageable: "unknown",
      matched: "unknown",
      total: "unknown",
    });
    const [delivery] = deliveries(source);
    expect(delivery).toMatchObject({
      status: "succeeded",
      page: {
        counts: {
          pageable: { kind: "unknown" },
          matched: { kind: "unknown" },
          total: { kind: "unknown" },
        },
      },
    });
  });
});
