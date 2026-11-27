import type { Option } from "../../../../subcomponent/types.js";

/** Converts an option to the text shown for it. @note Pure. */
export default function convertItemToString(item: Option | null): string {
  return item ? item.label : "";
}
