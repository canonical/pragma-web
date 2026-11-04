import {
  DEFAULT_WINDOW,
  type Source,
  type SourceDelivery,
  type SourceRequest,
} from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import createFailingSource from "./createFailingSource.js";
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

describe("createFailingSource", () => {
  it("fails every request, saying why", () => {
    expect(deliveries(createFailingSource())).toEqual([
      {
        status: "failed",
        failure: {
          reason: "the machine inventory could not be reached",
          cause: null,
          transient: null,
        },
      },
    ]);
  });
});
