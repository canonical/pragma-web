import { MESSAGES } from "#i18n";

/**
 * The stations lens in the rail: its label and its place, first. The
 * Definitions lens keeps its own place, third.
 */
export const STATIONS_LENS = { label: MESSAGES["lens.stations"], order: 1 };

/** The lines lens in the rail: its label and its place, second. */
export const LINES_LENS = { label: MESSAGES["lens.lines"], order: 2 };
