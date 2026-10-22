import { useContext } from "react";
import LensFilterContext from "../Context.js";
import type { UseLensFilterResult } from "./types.js";

/**
 * Read the lens's shared filter. Outside a provider it degrades to the no-op
 * default with an inert setter rather than throwing.
 *
 * @note Impure: reads the filter context in scope, so the value it returns
 *   changes whenever the nearest provider's filter does.
 * @returns The filter and the way to change it.
 */
export default function useLensFilter(): UseLensFilterResult {
  return useContext(LensFilterContext);
}
