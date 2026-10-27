import { LENGTH_FORMAT } from "../constants.js";

/**
 * Format a length the graph gives in whole millimetres as metres, the unit
 * a reader compares trains and platforms in: 120000 reads "120 m".
 *
 * @param millimetres - The length, in whole millimetres.
 * @returns The length in metres, in the app's locale.
 */
export default function formatLength(millimetres: number): string {
  return LENGTH_FORMAT.format(millimetres / 1000);
}
