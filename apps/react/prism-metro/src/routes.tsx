import { definitionsRoutes } from "@canonical/prism-lens-definitions";
import { Head } from "@canonical/react-head";
import { group, route } from "@canonical/router-core";
import {
  definitionsLayout,
  linesLayout,
  linesRoutes,
  stationsLayout,
  stationsRoutes,
} from "#domains/lenses";
import { MESSAGES } from "#i18n";

/** The page every URL no route matches renders, at its own `/not-found`. */
export const notFoundRoute = route({
  url: "/not-found",
  content: () => (
    <section>
      <Head title={MESSAGES["notFound.title"]} />
      <h1>{MESSAGES["notFound.title"]}</h1>
      <p>{MESSAGES["notFound.body"]}</p>
    </section>
  ),
});

// Each lens renders its routes inside its own layout: the routes of one group
// share a wrapper, and the wrapper renders the rail, the lens's strip and any
// provider the strip and the page share. Above every layout sits `Shell`, the
// provider nest the client and server entries mount.

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
  definitions,
  stations,
  lines,
  definitionsTerm,
  stationsEntity,
  linesEntity,
} as const;

export type AppRoutes = typeof appRoutes;

declare module "@canonical/router-react" {
  interface RouterRegister {
    routes: AppRoutes;
  }
}
