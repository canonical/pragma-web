import type { Option } from "../../../../subcomponent/types.js";
import { VALUE_KEY } from "../constants.js";

/** Finds the option whose `valueKey` equals the value. @note Pure. */
export default function convertValueToItem(
  value: string,
  items: readonly Option[],
  valueKey: keyof Option = VALUE_KEY,
): Option | null {
  return items.find((item) => item[valueKey] === value) ?? null;
}
