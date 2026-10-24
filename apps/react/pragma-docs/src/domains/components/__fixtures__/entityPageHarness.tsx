/**
 * Shared harness for the entity view's warm-store tests: the REAL
 * `ComponentEntityPage` under the real provider stack (Relay environment
 * seeded — or not — `HeadProvider`, and a static router over the app's
 * routes at the entity's address), so every section test exercises the
 * exact fragment fan-out production renders. The router, the site's homes
 * and its projection maps are there for the anatomy's and the relations'
 * links, which build their hrefs through them.
 *
 * Lives in `__fixtures__` beside the captured record maps: imported by
 * tests, never collected as one.
 */

import {
  createEnvironment,
  createStaticRouter,
  HomesProvider,
  RouterLink,
} from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { HeadProvider } from "@canonical/react-head";
import { RouterProvider } from "@canonical/router-react";
import type { ReactElement } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { FetchFunction } from "relay-runtime";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import formatDocumentTitle from "../../../formatDocumentTitle.js";
import { homes } from "../../../homes.js";
import { appRoutes, middleware, notFoundRoute } from "../../../routes.js";
import { ComponentEntityPage } from "../lib/ComponentEntityPage/index.js";

/** The captured exemplars' URIs. */
export const BUTTON_URI = "ds:global.component.button";
export const CARD_URI = "ds:global.component.card";
export const ACCORDION_URI = "ds:global.component.accordion";

/**
 * Contention insurance: these tests mount the full provider stack and a
 * static router, which can overrun the 5s default under heavy parallel
 * load. Per test only; the config default stands.
 */
export const ENTITY_TEST_TIMEOUT_MS = 15_000;

/**
 * The entity page at `uri` over an environment seeded with `records`
 * (`undefined` = cold store). The page owns its Suspense/ErrorBoundary, so
 * the harness adds none.
 */
export const entityPageAt = (
  uri: string,
  records: RecordMap | undefined,
  fetchFn: FetchFunction,
): ReactElement => (
  <HeadProvider titleTemplate={formatDocumentTitle}>
    <RelayEnvironmentProvider
      environment={createEnvironment({ records, fetchFn })}
    >
      <RouterProvider
        router={createStaticRouter(
          appRoutes,
          `/components/${encodeURIComponent(uri)}`,
          { middleware: [...middleware], notFound: notFoundRoute },
        )}
      >
        <HomesProvider homes={homes}>
          <ProjectionsProvider
            LinkComponent={RouterLink}
            maps={defaultProjectionMaps}
          >
            <ComponentEntityPage params={{ uri }} />
          </ProjectionsProvider>
        </HomesProvider>
      </RouterProvider>
    </RelayEnvironmentProvider>
  </HeadProvider>
);

/** The absolute IRI the store keys a design-system block's record by. */
const recordIdOf = (uri: string): string =>
  uri.replace(/^ds:/, "https://ds.canonical.com/");

/**
 * A copy of `records` with fields of the block at `uri` replaced: the way a
 * test states what the graph answers for that block without hand-writing
 * a store.
 *
 * @throws When the records hold no such block.
 */
export const editBlock = (
  records: RecordMap,
  uri: string,
  fields: Readonly<Record<string, unknown>>,
): RecordMap => {
  const copy = structuredClone(records) as unknown as Record<
    string,
    Record<string, unknown>
  >;
  const record = copy[recordIdOf(uri)];
  if (record === undefined) {
    throw new Error(`the records hold no block at ${uri}`);
  }
  Object.assign(record, fields);
  return copy as unknown as RecordMap;
};

/**
 * A copy of `records` in which the block at `uri` holds exactly the given
 * properties, each written as the store writes a plain list's items.
 *
 * @throws When the records hold no such block.
 */
export const setProperties = (
  records: RecordMap,
  uri: string,
  properties: readonly Readonly<Record<string, unknown>>[],
): RecordMap => {
  const ids = properties.map(
    (_, index) => `client:${recordIdOf(uri)}:properties:${index}`,
  );
  const copy = editBlock(records, uri, {
    properties: { __refs: ids },
  }) as unknown as Record<string, Record<string, unknown>>;
  for (const [index, property] of properties.entries()) {
    const id = ids.at(index) ?? "";
    copy[id] = { __id: id, __typename: "Property", ...property };
  }
  return copy as unknown as RecordMap;
};
