import { LOCALE } from "#i18n";

/** Metres to at most one decimal, in the app's locale. */
const METRES = new Intl.NumberFormat(LOCALE, {
  style: "unit",
  unit: "meter",
  maximumFractionDigits: 1,
});

/**
 * Format a length the graph gives in whole millimetres as metres, the unit
 * a reader compares trains and platforms in: 120000 reads "120 m".
 *
 * @param millimetres - The length, in whole millimetres.
 * @returns The length in metres, in the app's locale.
 */
export default function formatLength(millimetres: number): string {
  return METRES.format(millimetres / 1000);
}
