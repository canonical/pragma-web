import {
  DEFAULT_WINDOW,
  type Source,
  type SourceDelivery,
  type SourceRequest,
} from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import createForbiddingSource from "./createForbiddingSource.js";
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

describe("createForbiddingSource", () => {
  it("forbids every request, saying nothing of why", () => {
    expect(deliveries(createForbiddingSource())).toEqual([
      { status: "forbidden", cause: null },
    ]);
  });
});
