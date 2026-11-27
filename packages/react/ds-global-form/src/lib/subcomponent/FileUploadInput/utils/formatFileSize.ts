const UNITS = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"] as const;

/**
 * Formats a byte count as a short, human-readable size in the given locale,
 * for example `1.5 MB` in English or `1,5 MB` in German. Sizes step by 1024.
 * @note Pure.
 */
export default function formatFileSize(bytes: number, locale = "en"): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: UNITS[unit],
    unitDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
}
