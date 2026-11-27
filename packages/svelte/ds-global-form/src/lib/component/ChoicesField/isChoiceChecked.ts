/**
 * Tells whether an option is selected in a choice group's value.
 * @note Pure.
 */
export default function isChoiceChecked(
  current: string | string[] | undefined,
  optionValue: string,
  isMultiple: boolean,
): boolean {
  return isMultiple
    ? Array.isArray(current) && current.includes(optionValue)
    : current === optionValue;
}
