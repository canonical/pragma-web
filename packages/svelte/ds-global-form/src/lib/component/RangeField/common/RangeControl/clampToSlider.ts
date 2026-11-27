/**
 * A range input cannot represent "empty", so the slider mirror is clamped to a
 * valid number: `min` when the source is blank or not numeric, otherwise the
 * value bounded by `min` and `max`.
 * @note Pure.
 */
export default function clampToSlider(
  raw: number | null | undefined,
  min: number,
  max: number,
): number {
  if (raw === null || raw === undefined || Number.isNaN(raw)) return min;
  return Math.min(Math.max(raw, min), max);
}
