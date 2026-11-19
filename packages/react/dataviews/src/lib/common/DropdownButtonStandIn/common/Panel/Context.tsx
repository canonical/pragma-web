import { createContext } from "react";
import type { PanelContextValue } from "./hooks/types.js";

/** The state a trigger and its panel share; undefined outside them. */
const Context = createContext<PanelContextValue | undefined>(undefined);

export default Context;
