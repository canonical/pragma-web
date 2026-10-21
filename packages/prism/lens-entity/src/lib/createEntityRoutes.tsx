import {
  defineBinding,
  type EntityBinding,
  routeLensFacet,
} from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import type { ReactElement } from "react";
import { ENTITY_ROUTE_SUFFIX } from "./constants.js";
import { EntityIcon } from "./EntityIcon/index.js";
import { EntityIndexPage } from "./EntityIndexPage/index.js";
import { EntityPage } from "./EntityPage/index.js";
import { readUriParam } from "./entityPageQuery.js";
import type { EntityLensOptions, EntityRoutes } from "./types.js";
import warmEntity from "./warmEntity.js";
import warmEntityIndex from "./warmEntityIndex.js";

/**
 * Create the entity lens's two routes for one binding, under the names a
 * site's route table keeps them by:
 *
 * - `${id}`, at `/${id}`: the bound class's index, which declares the lens
 *   (`routeLensFacet`), so the rail and the trail link to it;
 * - `${id}Entity`, at `/${id}/:uri`: one instance, the address compact
 *   (`/stations/metro%3Anorthgate`, the form the site's homes build from
 *   `_meta.curie`) or absolute.
 *
 * The URL is the binding's id as written, a stated convention rather than a
 * pluralisation: a binding `stations` gives `/stations`. Each route reaches
 * the store through its `warm`, the one seam between the router and the
 * data layer: on the server the site's prepare step awaits it with a
 * per-request environment, and in the browser it does nothing when the
 * store already holds the data.
 *
 * The binding is checked where it is used, through `defineBinding`, so a
 * malformed id throws here rather than producing route names a register
 * cannot carry. Two bindings give two lenses, which may share a route table
 * as long as their ids and their orders differ.
 *
 * `import { createEntityRoutes } from "@canonical/prism-lens-entity";`
 *
 * @param binding - The class the lens shows, and the type serving it.
 * @param lens - The lens's label, rail order and optional icon.
 * @returns The two routes, keyed by their literal names.
 * @throws When the binding is malformed.
 */
export default function createEntityRoutes<const TId extends string>(
  binding: EntityBinding<TId>,
  lens: EntityLensOptions,
): EntityRoutes<TId> {
  const { id } = defineBinding(binding);
  const { label, order, icon = EntityIcon } = lens;

  const EntityIndexContent = (): ReactElement => (
    <EntityIndexPage binding={binding} label={label} />
  );
  const EntityPageContent = ({
    params,
  }: {
    readonly params: Readonly<Record<string, unknown>>;
  }): ReactElement => (
    <EntityPage binding={binding} label={label} uri={readUriParam(params)} />
  );

  const index = route({
    url: `/${id}`,
    content: EntityIndexContent,
    warm: () => warmEntityIndex(binding),
    meta: routeLensFacet.of({ label, icon, order, tier: 1 }),
  });
  const entity = route({
    url: `/${id}/:uri`,
    content: EntityPageContent,
    warm: (params) => warmEntity(binding, params),
  });

  // The one cast: the table's keys are computed from the binding's id, and
  // TypeScript types a computed key as `string`, so the literal key types
  // `EntityRoutes` states (and the routes' literal URL types) are asserted
  // here, where the values are built from the very same `id`.
  return {
    [id]: index,
    [`${id}${ENTITY_ROUTE_SUFFIX}`]: entity,
  } as unknown as EntityRoutes<TId>;
}
