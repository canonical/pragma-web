/**
 * Computes a choice group's next value after one option is checked or
 * unchecked: the option's value for a radio group, or the selection with the
 * option added or removed for a checkbox group.
 * @note Pure.
 */
export default function toggleChoice(
  current: string | string[] | undefined,
  optionValue: string,
  checked: boolean,
  isMultiple: boolean,
): string | string[] | undefined {
  if (!isMultiple) return checked ? optionValue : current;
  const selected = Array.isArray(current) ? current : [];
  const without = selected.filter((item) => item !== optionValue);
  return checked ? [...without, optionValue] : without;
}
