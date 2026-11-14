import {
  getPrefetchEnvironment,
  type ViewSearch,
  warmPageRenderer,
} from "@canonical/prism-core";
import { fetchQuery } from "relay-runtime";
import type { ComponentEntityQuery } from "#relay/__generated__/ComponentEntityQuery.graphql.js";
import {
  componentEntityQueryNode,
  componentEntityVariables,
} from "./entityQuery.js";

/**
 * Warm the store for one component's entity page: the entity named by the
 * matched `:uri` param, with the variables the page reads, then what the
 * address's page renderer reads of it, such as its Turtle, at the absolute
 * IRI the entity answers with (the address is compact).
 *
 * It reads the published prefetch environment once, synchronously, and
 * runs both steps against it, as the server publishes one only while a
 * route's `warm` runs synchronously. Each step answers from the store when
 * it holds the data.
 *
 * @param params - The matched route params, carrying the percent-decoded
 *   `uri`.
 * @param search - The matched view search, which selects the renderer.
 * @returns A promise that settles when the store holds the data, at once
 *   when no environment is published, or rejects with the entity's fetch
 *   error.
 * @note Impure: reads the module-level prefetch environment and performs up
 *   to two network requests through it.
 */
export default function warmComponentEntity(
  params: Readonly<Record<string, unknown>>,
  search: ViewSearch = {},
): Promise<void> {
  const environment = getPrefetchEnvironment();
  if (environment === undefined) return Promise.resolve();
  return fetchQuery<ComponentEntityQuery>(
    environment,
    componentEntityQueryNode,
    componentEntityVariables(params),
    { fetchPolicy: "store-or-network" },
  )
    .toPromise()
    .then((data) => {
      const uri = data?.component?.uri;
      return uri === undefined
        ? undefined
        : warmPageRenderer(uri, search, environment);
    });
}
