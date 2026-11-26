import type { Option } from "../../../../subcomponent/types.js";

function convertItemToString(item: Option | null): string {
  return item ? item.label : "";
}

export default convertItemToString;
