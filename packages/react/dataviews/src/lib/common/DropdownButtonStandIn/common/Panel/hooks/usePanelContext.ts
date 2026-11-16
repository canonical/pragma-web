import { useContext } from "react";
import Context from "../Context.js";
import type { UsePanelContextResult } from "./types.js";

/**
 * Reads the state a trigger and its panel share.
 *
 * @returns The panel context, or undefined outside a panel or a trigger's HOC.
 */
export default function usePanelContext(): UsePanelContextResult {
  return useContext(Context);
}
