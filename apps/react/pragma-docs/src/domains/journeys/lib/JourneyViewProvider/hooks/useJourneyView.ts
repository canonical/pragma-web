import { useContext } from "react";
import JourneyViewContext from "../Context.js";
import type { UseJourneyViewResult } from "./types.js";

/**
 * Read the lens's shared view. Outside a provider it degrades to the table
 * with an inert setter rather than throwing.
 *
 * @returns The view and the way to change it.
 * @note Impure: reads the view context in scope.
 */
export default function useJourneyView(): UseJourneyViewResult {
  return useContext(JourneyViewContext);
}
