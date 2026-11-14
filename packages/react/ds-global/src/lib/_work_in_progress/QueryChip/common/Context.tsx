import { createContext } from "react";
import type { QueryChipContextValue } from "./types.js";

/**
 * The chip a part belongs to. Outside a chip a part reads a chip that has
 * not mounted, so it renders its plain-text form.
 */
const Context = createContext<QueryChipContextValue>({
  isMounted: false,
  disabled: false,
});

export default Context;
