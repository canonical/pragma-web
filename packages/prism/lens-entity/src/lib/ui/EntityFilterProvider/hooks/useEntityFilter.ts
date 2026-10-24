import { useContext } from "react";
import EntityFilterContext from "../Context.js";
import type { UseEntityFilterResult } from "./types.js";

/**
 * Read the lens's shared filter. Outside a provider it degrades to the no-op
 * default with an inert setter rather than throwing.
 *
 * @returns The filter and the way to change it.
 * @note Impure: reads the filter context in scope.
 */
export default function useEntityFilter(): UseEntityFilterResult {
  return useContext(EntityFilterContext);
}
