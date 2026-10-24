import { useContext } from "react";
import JourneyViewContext from "../Context.js";
import type { UseJourneyViewResult } from "./types.js";

/**
 * Read the lens's shared view and the graph's filter as the reader chose
 * it. Outside a provider it degrades to the table and no choice, with
 * inert setters, rather than throwing.
 *
 * @returns The view, the filter and the ways to change them.
 * @note Impure: reads the view context in scope.
 */
export default function useJourneyView(): UseJourneyViewResult {
  return useContext(JourneyViewContext);
}
