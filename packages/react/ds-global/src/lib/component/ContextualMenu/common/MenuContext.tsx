import { createContext } from "react";
import type { MenuContextValue } from "./types.js";

/** The navigation every level of an open menu shares; null outside one. */
const MenuContext = createContext<MenuContextValue | null>(null);

export default MenuContext;
