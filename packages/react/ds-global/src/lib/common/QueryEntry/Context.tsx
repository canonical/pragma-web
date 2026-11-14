import { createContext } from "react";
import type { QueryEntryContextValue } from "./types.js";

/**
 * The combobox driving the nearest query entry, or `undefined` outside one,
 * where the entry is a plain text input.
 */
const Context = createContext<QueryEntryContextValue | undefined>(undefined);

export default Context;
