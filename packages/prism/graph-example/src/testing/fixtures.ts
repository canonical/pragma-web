/**
 * Shared test fixtures.
 *
 * The lens variables are keyed by operation name and use metro-network IRIs
 * throughout — if a lens can only be satisfied by a pragma IRI, it is not
 * provider-neutral, and that is exactly what this gate is for.
 *
 * The line IRIs name one line, or pair of lines, per topology the network
 * model has to carry, and the fleet IRIs one stock, formation, unit or line
 * per formation case, so each case's test reads the record it is about
 * rather than searching the network for something shaped right.
 */

import { METRO_NAMESPACE } from "../lib/provider/constants.js";
import {
  BARE_ENTITY_URI,
  EMPTY_LOCAL_NAME_URI,
} from "../lib/provider/dataset.js";

/** A class every lens that looks a term up can be pointed at. */
export const SAMPLE_CLASS_URI = "metro:Station";

/**
 * An entity every lens that looks an instance up can be pointed at.
 *
 * This MUST be an IRI the dataset actually carries, and it must be
 * absolute: `node(id:)` takes the absolute IRI and nothing else, so
 * `metro:northgate` resolves to null here exactly as it would against
 * ke-graphql. The value was previously `https://metro.example/stop/…`,
 * which resolved to nothing at all after the dataset moved its instances
 * into the declared namespaces — harmless only for as long as every
 * operation that used it failed validation first, and a confusing
 * green-nulls failure the moment one of them started validating.
 */
export const SAMPLE_ENTITY_URI = "https://metro.example/onto#northgate";

/**
 * Variables for each lens operation, by operation name.
 *
 * An operation discovered without an entry here FAILS the gate rather than
 * skipping it: a lens nobody wrote variables for is a lens nobody tested.
 */
export const LENS_OPERATION_VARIABLES: Record<
  string,
  Record<string, unknown>
> = {
  DefinitionsExplorerQuery: { uri: SAMPLE_CLASS_URI, hasTerm: true },
  // `JourneysExplorerQuery` used to be listed here. Journeys is no longer a
  // core lens — an owner reclassified it as a pragma-specific add-on and it
  // now lives in `apps/react/pragma-docs/src/addons/journeys`, outside the
  // scanned set — so the gate never discovers the operation and the entry was
  // dead config. Note the direction the gate checks: it walks DISCOVERED names
  // and demands a variables entry for each, so a leftover entry here would
  // never have failed anything. It was removed because it described nothing,
  // not to make a test pass.
  //
  // The standards lens now reaches its collection through the TBox, so it
  // needs a class binding — and this is the gate's OWN binding, never the
  // app's. The app's runtime binding lives in
  // `apps/react/pragma-docs/src/domains/lenses/standards/constants.ts`;
  // importing it here would couple the neutrality proof to the deployment it
  // exists to be independent of, and the gate would go green because the app
  // agreed with itself.
  StandardEntityQuery: { uri: SAMPLE_ENTITY_URI, classUri: SAMPLE_CLASS_URI },
  StandardsIndexQuery: {
    classUri: SAMPLE_CLASS_URI,
    count: 5,
    cursor: null,
  },
  StandardsIndexPaginationQuery: {
    classUri: SAMPLE_CLASS_URI,
    count: 5,
    cursor: null,
  },
  // The entity lens's operations, under `packages/prism/lens-entity`: the
  // bound class's index and its pagination, the namespaces lookup that
  // expands a compact address, and the entity page, which takes the
  // absolute IRI `node(id:)` accepts.
  EntityIndexQuery: { classUri: SAMPLE_CLASS_URI, count: 5, cursor: null },
  EntityIndexPaginationQuery: {
    classUri: SAMPLE_CLASS_URI,
    count: 5,
    cursor: null,
  },
  EntityNamespacesQuery: {},
  EntityPageQuery: { id: SAMPLE_ENTITY_URI, classUri: SAMPLE_CLASS_URI },
};

/** A line run both ways between two termini: two routes, each the other's reverse. */
export const LINEAR_LINE_URI = `${METRO_NAMESPACE}north-line`;

/** A loop run both ways: two loop routes from one first stop, each the other's reverse. */
export const BIDIRECTIONAL_LOOP_LINE_URI = `${METRO_NAMESPACE}circle-line`;

/**
 * Two linear lines that share both termini and no other stop, so together
 * they close a ring.
 */
export const HALF_RING_LINE_URIS = [
  `${METRO_NAMESPACE}upland-line`,
  `${METRO_NAMESPACE}lowland-line`,
] as const;

/**
 * A ring run by two lines in opposite directions over the same stops: each
 * line has one loop route and no reverse.
 */
export const DIRECTIONAL_RING_LINE_URIS = [
  `${METRO_NAMESPACE}ringway-clockwise`,
  `${METRO_NAMESPACE}ringway-anticlockwise`,
] as const;

/** The stations no route calls at, which therefore have no diagram position. */
export const BARE_STATION_URIS = [
  BARE_ENTITY_URI,
  EMPTY_LOCAL_NAME_URI,
] as const;

/** A rolling stock that runs in one fixed formation of one unit. */
export const FIXED_FORMATION_STOCK_URI = `${METRO_NAMESPACE}series-70`;

/** A rolling stock that runs its unit alone or two coupled together. */
export const COUPLED_STOCK_URI = `${METRO_NAMESPACE}series-90`;

/** {@link COUPLED_STOCK_URI}'s formation of one unit. */
export const SINGLE_UNIT_FORMATION_URI = `${METRO_NAMESPACE}series-90-three-car`;

/** {@link COUPLED_STOCK_URI}'s formation of two units coupled together. */
export const COUPLED_FORMATION_URI = `${METRO_NAMESPACE}series-90-six-car`;

/** A unit with a driving cab at its front only. */
export const ASYMMETRIC_UNIT_URI = `${METRO_NAMESPACE}unit-50`;

/**
 * A formation of two {@link ASYMMETRIC_UNIT_URI} units back to back, the
 * second reversed, so the train has a cab at each end.
 */
export const REVERSED_UNIT_FORMATION_URI = `${METRO_NAMESPACE}series-50-four-car`;

/** A line run by two rolling stocks. */
export const MIXED_STOCK_LINE_URI = `${METRO_NAMESPACE}coastal-line`;

/** The one formation longer than a platform it calls at. */
export const OVERLONG_FORMATION_URI = COUPLED_FORMATION_URI;

/** The line {@link OVERLONG_FORMATION_URI} overhangs a platform on. */
export const OVERLONG_LINE_URI = `${METRO_NAMESPACE}north-line`;

/** The station whose platform {@link OVERLONG_FORMATION_URI} overhangs. */
export const SHORT_PLATFORM_STATION_URI = `${METRO_NAMESPACE}marsh-end`;
