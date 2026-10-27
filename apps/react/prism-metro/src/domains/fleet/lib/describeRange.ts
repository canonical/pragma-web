import type { Translate } from "#i18n";

/**
 * Read a set of measures as a reader reads them: one value when every
 * member shares it, else the range from the least to the most, each end
 * described the same way.
 *
 * @param values - The measures, at least one.
 * @param describe - How one measure reads, such as "120 m".
 * @param t - The translator the range's words are read through.
 * @returns The value, or the range.
 */
export default function describeRange(
  values: readonly number[],
  describe: (value: number) => string,
  t: Translate,
): string {
  const least = Math.min(...values);
  const most = Math.max(...values);
  return least === most
    ? describe(least)
    : t("fleet.range", { min: describe(least), max: describe(most) });
}
