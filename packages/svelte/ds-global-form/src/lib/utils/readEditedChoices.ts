/**
 * Reads the radios or checkboxes a user changed inside `container` before the
 * page hydrated. Returns the values of the checked inputs when any input's
 * live state differs from its server-rendered `checked` attribute; otherwise
 * returns `undefined`, leaving the bound value as it is.
 *
 * Called from an attachment on the group's root, which runs as the group
 * hydrates and before the inputs' own `checked` properties are written.
 * @note Pure: reads the element without changing it.
 */
export default function readEditedChoices(
  container: Element,
): string[] | undefined {
  const inputs = [...container.querySelectorAll("input")];
  const edited = inputs.some((input) => input.checked !== input.defaultChecked);
  if (!edited) return undefined;
  return inputs.filter((input) => input.checked).map(({ value }) => value);
}
