import { MESSAGES } from "#i18n";

/**
 * The network lens in the rail: its label and its place, first, before the
 * stations and lines lenses, since its map draws what they list.
 */
export const NETWORK_LENS = { label: MESSAGES["lens.network"], order: 0 };

/** The class whose instances are the network's lines. */
export const LINE_CLASS_URI = "metro:Line";

/** The class whose instances are the stations where lines meet. */
export const INTERCHANGE_CLASS_URI = "metro:Interchange";

/**
 * How many lines the map reads in one request: more than any network this
 * site draws, so the map reads every line at once and never pages.
 */
export const LINE_PAGE_SIZE = 100;
