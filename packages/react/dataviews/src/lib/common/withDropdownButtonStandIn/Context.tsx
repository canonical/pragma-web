import { createContext } from "react";
import type { PanelContextValue } from "./types.js";

/** The open state a trigger shares with its panel. Undefined outside a trigger. */
const Context = createContext<PanelContextValue | undefined>(undefined);

export default Context;
