import { createContext } from "react";
import type { RovingContextValue } from "./types.js";

/**
 * The roving tab stop of the nearest composite, or `undefined` outside one,
 * which is how an item knows it is not roving.
 */
const Context = createContext<RovingContextValue | undefined>(undefined);

export default Context;
