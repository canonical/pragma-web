import type { Option } from "../../../../subcomponent/types.js";

/** Filters options whose label contains the typed text. @note Pure. */
export default function filterItems(
  items: readonly Option[],
  inputValue: string,
): Option[] {
  return items.filter(
    (item) =>
      !inputValue ||
      item.label.toLowerCase().includes(inputValue.toLowerCase()),
  );
}
