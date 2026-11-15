import type { SourceDelivery, SourcePage } from "../src/lib/result/index.js";

/** The page a delivery carries, or a failure when it did not succeed. */
export default function readSucceededPage<TRow extends object>(
  delivery: SourceDelivery<TRow>,
): SourcePage<TRow> {
  if (delivery.status !== "succeeded") {
    throw new Error(`expected a page, the delivery ${delivery.status}`);
  }
  return delivery.page;
}
