import type { NumberUnits } from "@canonical/dataviews-core";

/**
 * A number in base units as a reader would write it: in the largest display
 * unit it is at least one of, through the locale's formatter, then a
 * no-break space and the unit's symbol, so `16384` MiB spells `16 GiB`. A
 * value smaller than every unit, zero among them, takes the smallest; a
 * negative one is sized by its magnitude. Without units it is the number
 * alone. Symbols are data and are never translated. Pass a format with
 * `useGrouping: false` where the text is read back as typed input: a
 * grouping separator, as in `1,023`, is not part of a typed number. Pure.
 */
export default function spellNumberWithUnit(
  value: number,
  units: NumberUnits | undefined,
  format: Intl.NumberFormat,
): string {
  const display = units?.display ?? [];
  const smallest = display.at(0);
  if (smallest === undefined) {
    return format.format(value);
  }
  // The schema holds a field's units ascending, so the last one the value
  // reaches is the largest.
  const magnitude = Math.abs(value);
  const unit =
    display.findLast(({ factor }) => magnitude >= factor) ?? smallest;
  return `${format.format(value / unit.factor)} ${unit.symbol}`;
}
