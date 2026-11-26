import { createContext } from "react";
import type { ContextOptions } from "./types.js";

/**
 * The active DataViews root: its provider and its filter records.
 * `DataViews` writes it; the hooks and connected parts read it.
 */
const Context = createContext<ContextOptions | undefined>(undefined);

export default Context;
