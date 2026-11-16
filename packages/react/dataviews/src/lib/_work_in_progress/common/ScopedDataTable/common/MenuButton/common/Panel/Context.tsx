import { createContext } from "react";
import type { PanelContextValue } from "./types.js";

/** The menu a button hands its panel; null outside a menu button. */
const Context = createContext<PanelContextValue | null>(null);

export default Context;
