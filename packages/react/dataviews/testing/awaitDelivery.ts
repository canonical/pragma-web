import type {
  Source,
  SourceDelivery,
  SourceRequest,
} from "@canonical/dataviews-core";
import { onTestFinished } from "vitest";

/**
 * Execute a request and resolve with the first delivery `accept` takes,
 * any by default. The request stops once read, or when the test ends.
 *
 * @note Impure: the source sends a request.
 */
export default function awaitDelivery<
  TRow extends object,
  TTaken extends SourceDelivery<TRow>,
>(
  source: Source<TRow>,
  request: SourceRequest,
  accept: (delivery: SourceDelivery<TRow>) => delivery is TTaken,
): Promise<TTaken>;
export default function awaitDelivery<TRow extends object>(
  source: Source<TRow>,
  request: SourceRequest,
): Promise<SourceDelivery<TRow>>;
export default function awaitDelivery<TRow extends object>(
  source: Source<TRow>,
  request: SourceRequest,
  accept: (delivery: SourceDelivery<TRow>) => boolean = () => true,
): Promise<SourceDelivery<TRow>> {
  const taken = Promise.withResolvers<SourceDelivery<TRow>>();
  let running = true;
  const stop = source.execute(request, (delivery) => {
    if (accept(delivery)) {
      taken.resolve(delivery);
    }
  });
  const stopOnce = (): void => {
    if (running) {
      running = false;
      stop();
    }
  };
  onTestFinished(stopOnce);
  return taken.promise.finally(stopOnce);
}
