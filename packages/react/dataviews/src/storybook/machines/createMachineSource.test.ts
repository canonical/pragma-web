import {
  DEFAULT_WINDOW,
  type Source,
  type SourceDelivery,
  type SourceRequest,
} from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import createMachineSource from "./createMachineSource.js";
import { machines } from "./fixtures.js";
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

describe("createMachineSource", () => {
  it("answers every machine, counted", () => {
    const [delivery] = deliveries(createMachineSource());
    expect(delivery).toMatchObject({
      status: "succeeded",
      page: { counts: { matched: { kind: "exact", value: 12 } } },
    });
  });

  it("answers a caller's own rows, in the order it documents", () => {
    const source = createMachineSource({
      rows: machines.slice(0, 2),
      defaultSort: [{ field: "name", direction: "desc" }],
    });
    expect(source.capabilities.sort.default).toEqual([
      { field: "name", direction: "desc" },
    ]);
    const [delivery] = deliveries(source);
    expect(
      delivery?.status === "succeeded" ? delivery.page.rows : [],
    ).toHaveLength(2);
  });
});
