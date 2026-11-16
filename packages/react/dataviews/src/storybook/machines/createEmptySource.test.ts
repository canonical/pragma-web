import {
  DEFAULT_WINDOW,
  type Source,
  type SourceDelivery,
  type SourceRequest,
} from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import createEmptySource from "./createEmptySource.js";
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

describe("createEmptySource", () => {
  it("answers no machine", () => {
    const [delivery] = deliveries(createEmptySource());
    expect(delivery).toMatchObject({ status: "succeeded", page: { rows: [] } });
  });
});
