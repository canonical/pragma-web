/**
 * Read a set of measures as a reader reads them: one value when every
 * member shares it, else the range from the least to the most, written
 * once with the unit, as the format's locale writes ranges: "60–120 m".
 *
 * @param values - The measures, at least one.
 * @param format - How the measures read.
 * @returns The value, or the range.
 */
export default function describeRange(
  values: readonly number[],
  format: Intl.NumberFormat,
): string {
  const least = Math.min(...values);
  const most = Math.max(...values);
  return least === most
    ? format.format(least)
    : format.formatRange(least, most);
}
