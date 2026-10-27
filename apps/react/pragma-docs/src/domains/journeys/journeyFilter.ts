/**
 * The Journeys lens's EPHEMERAL view state — the vocabulary the rail, the
 * well and the mode strip's tenants all read. The Definitions lens's
 * `lensFilter.ts` is the model; this is its demand-model sibling.
 *
 * TWO AXES, and the second one is a confession.
 *
 * - `coordinate` — the coordinate whose journeys are drawn. This is an
 *   EXACT axis: a job carries exactly one coordinate, so "show this
 *   coordinate" is a total, honest predicate over the data.
 *
 * - `persona` — an APPROXIMATE axis, and the lens says so in the UI. The
 *   graph gives no exact answer here and this module refuses to fake one;
 *   see `personaMatchesCoordinate` for the measurement and the argument.
 *
 * THE SCALE RULING. ~260 nodes across 5 columns is too much to read at
 * once, and virtualisation is not available to us: it would break the SSR
 * determinism contract the well depends on (the well renders SVG
 * server-side only for nodes it is given). So the lens DEFAULTS TO A
 * FILTERED VIEW — one coordinate — rather than drawing everything and
 * hoping. `DEFAULT_JOURNEY_FILTER` is therefore NOT the no-op the
 * definitions filter is, and that difference is deliberate.
 *
 * SSR DETERMINISM still holds, by a different route: the default filter is
 * a pure function of the QUERY DATA (the first coordinate by URI order),
 * computed identically on both sides — never from `localStorage`,
 * `window` or the query string.
 */

import { type RawJob, readLocalName } from "./collectJourneys.js";
import type { JourneyCoordinate, JourneyFilterChoice } from "./types.js";

/**
 * The persona axis, and the honest statement of what it can and cannot do.
 *
 * MEASURED, against the live graph: `Persona` carries `uri` and `essence`
 * and NO axis fields at all — no roles, no actors, no fluencies. There is
 * therefore no edge in the graph from a persona to a job, and no exact
 * join to compute. The only available correspondence is NOMINAL: a
 * coordinate's role axis names terms like `role.architect`, and there is a
 * `persona.architect`, so the names line up for some personas.
 *
 * How far that gets us, measured over the 52 live jobs:
 *
 *   role.architect → 15 jobs      persona.agent    → 0 jobs
 *   role.steward   → 13 jobs      persona.designer → 0 jobs
 *   role.writer    → 13 jobs      persona.engineer → 0 jobs
 *
 * …and 26 of the 52 jobs carry an EMPTY role axis, which the ontology
 * reads as a wildcard ("any role"), not as a gap. So three of the six
 * personas match nothing by name, and half the jobs match every persona
 * by rule.
 *
 * This is why the axis is labelled approximate in the interface (the
 * catalog's `journeys.personaNote`, under the rail's chips and over the
 * table grouped by role) rather than presented as a filter that knows the
 * answer. The alternative —
 * inventing a persona→job mapping the ontology does not state — would be
 * the lens asserting something it cannot support, which is the one thing
 * a documentation surface must not do.
 */

/** The lens's whole ephemeral state. */
export interface JourneyFilter {
  /** The coordinate whose journeys are drawn; `undefined` draws all. */
  readonly coordinate: string | undefined;
  /** The approximate persona narrowing, or `undefined` for no narrowing. */
  readonly persona: string | undefined;
}

/** The unfiltered value — every coordinate, no persona narrowing. */
export const ALL_JOURNEYS_FILTER: JourneyFilter = {
  coordinate: undefined,
  persona: undefined,
};

/**
 * The lens's INITIAL filter, and the one place the URL gets a say.
 *
 * With NO job selected, the default is the first coordinate in URI order:
 * a readable single journey group rather than 260 unreadable nodes.
 *
 * With a job selected, the default is THAT JOB'S OWN COORDINATE. Anything
 * else would be an outright bug: a reader following a link to a job would
 * land on a diagram that does not contain it, because the job lives under
 * some other coordinate. The address names a job, so the initial view has
 * to be one where that job is visible.
 *
 * This reads the URL, but it does NOT break the SSR determinism rule: the
 * job comes from the route params, which the server and the client both
 * have before the first render. It is the same input on both sides, unlike
 * `localStorage` or `window` — which remain forbidden here.
 */
export const chooseDefaultJourneyFilter = (
  coordinateUris: readonly string[],
  selectedCoordinate?: string | undefined,
): JourneyFilter => ({
  coordinate: selectedCoordinate ?? [...coordinateUris].sort().at(0),
  persona: undefined,
});

/** Strip the filing prefix a Turtle local name carries (`role.architect`
 * → `architect`, `persona.architect` → `architect`). */
const readBareTerm = (uri: string): string =>
  readLocalName(uri).replace(/^(?:persona|role|fluency|actor)\./, "");

/**
 * Does a coordinate match a persona, APPROXIMATELY? True when the
 * coordinate names a role whose bare term equals the persona's, and true
 * when the coordinate names NO role at all — the ontology's own reading of
 * an unconstrained axis is "any role", so an unconstrained coordinate
 * genuinely does serve every persona. Both readings are the data's, not
 * this module's invention; the approximation is in the name-matching step,
 * which the interface states plainly to the reader.
 */
export const personaMatchesCoordinate = (
  persona: string | undefined,
  roleUris: readonly string[],
): boolean => {
  if (persona === undefined) return true;
  if (roleUris.length === 0) return true;
  const wanted = readBareTerm(persona);
  return roleUris.some((role) => readBareTerm(role) === wanted);
};

/**
 * Select what the graph draws: the filter in force, the reader's choice
 * when it was made on the job now on screen, else the default for that
 * job, and the coordinates it keeps. The explorer draws them and the
 * inspector counts them, each from the same data, so the two agree on the
 * server and on the client.
 *
 * @param coordinates - The coordinate tree `collectJourneys` builds.
 * @param jobs - The operation's jobs, which carry each coordinate's roles.
 * @param choice - The reader's choice, if any.
 * @param job - The selected job's URI, or undefined on the lens index.
 * @returns The filter in force and the coordinates it keeps.
 */
export const selectDrawnJourneys = (
  coordinates: readonly JourneyCoordinate[],
  jobs: readonly RawJob[],
  choice: JourneyFilterChoice | undefined,
  job: string | undefined,
): {
  readonly filter: JourneyFilter;
  readonly drawn: readonly JourneyCoordinate[];
} => {
  const selectedCoordinate =
    job === undefined
      ? undefined
      : coordinates.find((coordinate) =>
          coordinate.jobs.some((entry) => entry.uri === job),
        )?.uri;
  const filter =
    choice !== undefined && choice.job === job
      ? choice.filter
      : chooseDefaultJourneyFilter(
          coordinates.map((coordinate) => coordinate.uri),
          selectedCoordinate,
        );
  const rolesByCoordinate = new Map<string, readonly string[]>();
  for (const { coordinates: coordinate } of jobs) {
    if (coordinate == null) continue;
    rolesByCoordinate.set(
      coordinate.uri,
      (coordinate.roles?.edges ?? []).map((edge) => edge.node.uri),
    );
  }
  const drawn = coordinates.filter(
    (coordinate) =>
      (filter.coordinate === undefined ||
        filter.coordinate === coordinate.uri) &&
      personaMatchesCoordinate(
        filter.persona,
        rolesByCoordinate.get(coordinate.uri) ?? [],
      ),
  );
  return { filter, drawn };
};

/** A persona's display term, for chips and the rail's heading. */
export const readPersonaTerm = (uri: string): string => readBareTerm(uri);
