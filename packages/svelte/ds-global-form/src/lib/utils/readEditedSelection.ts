/**
 * Reads the options a user selected before the page hydrated. Returns the
 * selected values when the server rendered a selection (some option carries the
 * `selected` attribute) and the live selection differs from it; otherwise
 * returns `undefined`, so a client-rendered select or an untouched one is left
 * to the value binding.
 * @note Pure: reads the element without changing it.
 */
export default function readEditedSelection(
  select: HTMLSelectElement,
): string[] | undefined {
  const options = [...select.options];
  const serverRendered = options.some((option) => option.defaultSelected);
  const edited = options.some(
    (option) => option.selected !== option.defaultSelected,
  );
  if (!serverRendered || !edited) return undefined;
  return options.filter((option) => option.selected).map(({ value }) => value);
}
