import { DocumentLayout } from "@canonical/prism-core";
import { definitionsRoutes } from "@canonical/prism-lens-definitions";
import { group, route } from "@canonical/router-core";
import {
  definitionsLayout,
  linesLayout,
  linesRoutes,
  MetroRail,
  stationsLayout,
  stationsRoutes,
} from "#domains/lenses";
import { homeLayout, homeRoutes } from "#domains/metro";
import { networkLayout, networkRoutes } from "#domains/network";
import { NotFoundPage } from "#lib/ui";

/**
 * The page every URL no route matches renders, at its own `/not-found`: the
 * document archetype with the site's rail, so a reader who lands there keeps
 * the grid and a way back.
 */
export const notFoundRoute = route({
  url: "/not-found",
  content: () => (
    <DocumentLayout rail={<MetroRail />}>
      <NotFoundPage />
    </DocumentLayout>
  ),
});

// Each lens renders its routes inside its own layout: the routes of one group
// share a wrapper, and the wrapper renders the rail, the lens's strip and any
// provider the strip and the page share. The landing renders inside its own
// wrapper too, the document archetype with the rail; it is not a lens and
// declares none. Above every layout sits `Shell`, the provider nest the
// client and server entries mount.

const [home] = group(homeLayout, [homeRoutes.home] as const);

// The network lens's map is a workspace and shares its wrapper; its station
// and line pages are documents that render their own archetype, so they sit
// in the table directly.
const [network] = group(networkLayout, [networkRoutes.network] as const);
const { networkStation, networkLine } = networkRoutes;

const [definitions, definitionsTerm] = group(definitionsLayout, [
  definitionsRoutes.definitions,
  definitionsRoutes.definitionsTerm,
] as const);

const [stations, stationsEntity] = group(stationsLayout, [
  stationsRoutes.stations,
  stationsRoutes.stationsEntity,
] as const);

const [lines, linesEntity] = group(linesLayout, [
  linesRoutes.lines,
  linesRoutes.linesEntity,
] as const);

/**
 * The route table. The router ranks patterns by specificity and falls back
 * to this key order between equals. The lens packages link by these names,
 * so the table keeps each lens's keys as the lens returns them.
 */
export const appRoutes = {
  home,
  network,
  definitions,
  stations,
  lines,
  definitionsTerm,
  stationsEntity,
  linesEntity,
  networkStation,
  networkLine,
} as const;

/**
 * The route table's type. The `RouterRegister` augmentation below carries
 * it, so the router types every route name and its params from this table.
 */
export type AppRoutes = typeof appRoutes;

declare module "@canonical/router-react" {
  interface RouterRegister {
    routes: AppRoutes;
  }
}
