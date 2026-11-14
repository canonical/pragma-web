import { createContext } from "react";
import type { PanelContextValue } from "./hooks/types.js";

/**
 * The state a trigger and its panel share. Undefined outside a panel or a
 * trigger's HOC.
 */
export default createContext<PanelContextValue | undefined>(undefined);
