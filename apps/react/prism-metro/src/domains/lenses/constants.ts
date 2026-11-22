import type { EntityLensOptions } from "@canonical/prism-lens-entity";
import { MESSAGES } from "#i18n";

/**
 * The list renderers the stations and lines indexes offer: the table first,
 * and the cards their entries' card arms draw.
 */
export const METRO_LIST_RENDERERS = { list: ["table", "cards"] } as const;

/**
 * The stations lens in the rail: its label and its place, first. The
 * Definitions lens keeps its own place, third. Its table leaves out the
 * station's place on the diagram and on the ground, coordinate pairs no
 * reader compares in a column.
 */
export const STATIONS_LENS = {
  label: MESSAGES["lens.stations"],
  order: 1,
  renderers: METRO_LIST_RENDERERS,
  tableOmits: ["diagramPosition", "location"],
} as const satisfies EntityLensOptions;

/**
 * The lines lens in the rail: its label and its place, second. Its index
 * places its filters (the count and the search) in a panel beside the
 * list. Its table leaves out the line's colour, a code no reader reads as
 * text: the line's mark carries it, and a table's row draws no mark.
 */
export const LINES_LENS = {
  label: MESSAGES["lens.lines"],
  order: 2,
  filters: "panel",
  renderers: METRO_LIST_RENDERERS,
  tableOmits: ["colour"],
} as const satisfies EntityLensOptions;
