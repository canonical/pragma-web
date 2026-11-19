import { createContext } from "react";
import type { QueryChipPartContextValue } from "./types.js";

/**
 * What a chip tells each of its parts: the chip's state, the part's role in
 * the toolbar and its description ids. Outside a chip a part reads a chip
 * that has not mounted, so it renders its plain-text form.
 */
const Context = createContext<QueryChipPartContextValue>({
  isMounted: false,
  disabled: false,
  isItem: false,
  isRefusedReason: false,
  faultIds: [],
});

export default Context;
