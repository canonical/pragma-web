import {
  defineBinding,
  type EntityBinding,
  routeLensFacet,
  viewSearch,
} from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import type { ReactElement } from "react";
import { ENTITY_ROUTE_SUFFIX } from "./constants.js";
import readUriParam from "./readUriParam.js";
import type { EntityLensOptions, EntityRoutes } from "./types.js";
import { EntityIcon } from "./ui/EntityIcon/index.js";
import { EntityIndexPage } from "./ui/EntityIndexPage/index.js";
import { EntityPage } from "./ui/EntityPage/index.js";
import warmEntity from "./warmEntity.js";
import warmEntityIndex from "./warmEntityIndex.js";

/**
 * Create the entity lens's two routes for one binding, under the names a
 * site's route table keeps them by:
 *
 * - `${id}`, at `/${id}`: the bound class's index, which declares the lens
 *   (`routeLensFacet`), so the rail and the trail link to it, and reads
 *   its renderer and its search from the address (`/${id}?as=cards&q=cen`);
 * - `${id}Entity`, at `/${id}/:uri`: one instance, the address compact
 *   (`/stations/metro%3Anorthgate`, the form the site's homes build from
 *   `_meta.curie`) or absolute, in the renderer the address names
 *   (`?as=turtle`).
 *
 * Both routes declare core's view search, so a site's register carries the
 * view's parameters.
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
 * @param lens - The lens's label, rail order, optional icon, renderers and
 *   filter placement.
 * @returns The two routes, keyed by their literal names.
 * @throws When the binding is malformed.
 */
export default function createEntityRoutes<const TId extends string>(
  binding: EntityBinding<TId>,
  lens: EntityLensOptions,
): EntityRoutes<TId> {
  const { id } = defineBinding(binding);
  const { label, order, icon = EntityIcon, renderers, filters } = lens;

  const EntityIndexContent = (): ReactElement => (
    <EntityIndexPage
      binding={binding}
      filters={filters}
      label={label}
      renderers={renderers}
    />
  );
  const EntityPageContent = ({
    params,
  }: {
    readonly params: Readonly<Record<string, unknown>>;
  }): ReactElement => (
    <EntityPage
      binding={binding}
      label={label}
      renderers={renderers}
      uri={readUriParam(params)}
    />
  );

  const index = route({
    url: `/${id}`,
    search: viewSearch,
    content: EntityIndexContent,
    warm: () => warmEntityIndex(binding),
    meta: routeLensFacet.of({ label, icon, order, tier: 1 }),
  });
  const entity = route({
    url: `/${id}/:uri`,
    search: viewSearch,
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
