import { spellQueryKey } from "../query/index.js";
import type { SourcePage } from "../result/index.js";
import type { RowRecord } from "../rows/index.js";
import copyCapabilities from "./copyCapabilities.js";
import resolveErrorDelivery from "./resolveErrorDelivery.js";
import type { QueryObservation, QuerySourceConfig, Source } from "./types.js";

/** The last thing delivered, so an unchanged observation is not repeated. */
type Delivered<TRow extends object> =
  | { readonly status: "succeeded"; readonly page: SourcePage<TRow> }
  | { readonly status: "failed"; readonly error: unknown };

/**
 * Create a source over an observable query client such as TanStack Query.
 * Each request attaches one observer to the query keyed by its canonical
 * query and window, so two requests for the same query share the client's
 * cache entry; a cached page is delivered at attach time, and every later
 * observation — a refetch, an invalidation, a store write — is delivered
 * too. Releasing detaches the observer and leaves the cache alone.
 *
 * A query whose fetch was forbidden delivers no success, in that request or
 * a later one, until a fetch of it completes: a write into its cache, such
 * as an optimistic update, is no grant of access.
 *
 * Unchanged observations are recognised by reference, so the client must
 * hand back the same `data` reference while the payload has not changed.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function createQuerySource<TRow extends object = RowRecord>(
  config: QuerySourceConfig<TRow>,
): Source<TRow> {
  const capabilities = copyCapabilities(config.capabilities);
  /**
   * The queries a fetch was forbidden for, by their canonical key: their
   * rows stay withdrawn until a fetch of the query completes.
   */
  const forbidden = new Set<string>();
  return {
    capabilities,
    ...(config.refusals === undefined ? {} : { refusals: config.refusals }),
    execute(request, deliver) {
      const key = spellQueryKey(request);
      /** The forbidden mark this request's query is kept under. */
      const mark = JSON.stringify([key, request.facets]);
      const observer = config.createObserver({
        queryKey: [...config.queryKey, key, request.facets],
        queryFn: async () => {
          const page = await config.fetchPage(request);
          // A fetch of the query completed: the reader may see it again.
          forbidden.delete(mark);
          return page;
        },
      });
      let delivered: Delivered<TRow> | null = null;

      const push = (observation: QueryObservation<SourcePage<TRow>>): void => {
        switch (observation.status) {
          case "pending":
            // The coordinator already shows the request as in flight.
            return;
          case "success": {
            const page = observation.data;
            if (page === undefined || forbidden.has(mark)) {
              return;
            }
            if (delivered?.status === "succeeded" && delivered.page === page) {
              return;
            }
            delivered = { status: "succeeded", page };
            deliver({ status: "succeeded", page });
            return;
          }
          case "error": {
            const { error } = observation;
            if (delivered?.status === "failed" && delivered.error === error) {
              return;
            }
            delivered = { status: "failed", error };
            const answer = resolveErrorDelivery(error, config.isForbidden);
            if (answer.status === "forbidden") {
              forbidden.add(mark);
            }
            deliver(answer);
            return;
          }
        }
      };

      const unsubscribe = observer.subscribe(push);
      push(observer.getCurrentResult());
      return () => {
        unsubscribe();
        observer.destroy();
      };
    },
    ...(config.runAction === undefined ? {} : { runAction: config.runAction }),
  };
}
