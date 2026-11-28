import {
  DEFAULT_WINDOW,
  EMPTY_SLICE,
  type Source,
  type SourceDelivery,
} from "@canonical/dataviews-core";
import type { Machine } from "../src/storybook/machines/index.js";
import awaitDelivery from "./awaitDelivery.js";

/**
 * Run one request through a story source and read the reason it fails
 * with, once it has.
 *
 * @note Impure: the source sends a request.
 */
export default async function readFailureReason(
  source: Source<Machine>,
): Promise<string> {
  const delivery = await awaitDelivery(
    source,
    {
      requestId: "failure",
      slice: EMPTY_SLICE,
      window: DEFAULT_WINDOW,
      facets: [],
    },
    (taken): taken is Extract<SourceDelivery<Machine>, { status: "failed" }> =>
      taken.status === "failed",
  );
  return delivery.failure.reason;
}
