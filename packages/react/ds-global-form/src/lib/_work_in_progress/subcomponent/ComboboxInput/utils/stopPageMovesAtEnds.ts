import {
  type UseComboboxState,
  type UseComboboxStateChangeOptions,
  useCombobox,
} from "downshift";
import type { Option } from "../../../../subcomponent/types.js";

const PAGE_SIZE = 10;

/**
 * A downshift state reducer that stops a PageUp or PageDown move at the first
 * or the last item, as the WAI-ARIA listbox pattern asks, where downshift
 * wraps it to the other end. A highlight outside the list starts from the
 * matching end, as downshift's does. `count` is the number of items listed.
 * Every other change passes through.
 * @note Pure.
 */
function stopPageMovesAtEnds(
  state: UseComboboxState<Option>,
  { type, changes }: UseComboboxStateChangeOptions<Option>,
  count: number,
): Partial<UseComboboxState<Option>> {
  const { InputKeyDownPageUp, InputKeyDownPageDown } =
    useCombobox.stateChangeTypes;
  if (type !== InputKeyDownPageUp && type !== InputKeyDownPageDown) {
    return changes;
  }
  const offset = type === InputKeyDownPageUp ? -PAGE_SIZE : PAGE_SIZE;
  const start = state.highlightedIndex;
  const from = start < 0 || start >= count ? (offset > 0 ? -1 : count) : start;
  return {
    ...changes,
    highlightedIndex:
      count === 0 ? -1 : Math.min(Math.max(from + offset, 0), count - 1),
  };
}

export default stopPageMovesAtEnds;
