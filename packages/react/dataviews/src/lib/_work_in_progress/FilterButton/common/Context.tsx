import { createContext } from "react";
import type { FilterButtonContextValue } from "../types.js";

/**
 * The props FilterButton passes to its panel, which the dropdown renders
 * beside the trigger. Undefined outside a FilterButton.
 */
const Context = createContext<FilterButtonContextValue | undefined>(undefined);

export default Context;
