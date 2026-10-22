import { createEntityRoutes } from "@canonical/prism-lens-entity";
import { LINES_BINDING, STATIONS_BINDING } from "./bindings.js";
import { LINES_LENS, STATIONS_LENS } from "./constants.js";

// Every lens domain keeps its route tables in a `routes.ts` barrel, the one
// file the site's route table reads a lens from, so this file keeps that
// shared name rather than the name of either export.

/** The stations lens's routes: `stations` at `/stations` and
 * `stationsEntity` at `/stations/:uri`. */
export const stationsRoutes = createEntityRoutes(
  STATIONS_BINDING,
  STATIONS_LENS,
);

/** The lines lens's routes: `lines` at `/lines` and `linesEntity` at
 * `/lines/:uri`. */
export const linesRoutes = createEntityRoutes(LINES_BINDING, LINES_LENS);
