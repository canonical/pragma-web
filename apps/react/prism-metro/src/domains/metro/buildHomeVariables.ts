import { LINES_BINDING, STATIONS_BINDING } from "#domains/lenses";
import type { MetroHomeQuery$variables } from "./homeQuery.js";

/**
 * Build the landing's variables: the classes the stations and lines lenses
 * are bound to. The route's warm and the doors' read share this one
 * builder, so the variables are identical and the warm store fulfils the
 * read.
 *
 * @returns The operation's variables.
 */
export default function buildHomeVariables(): MetroHomeQuery$variables {
  return {
    stationClass: STATIONS_BINDING.classUri,
    lineClass: LINES_BINDING.classUri,
  };
}
