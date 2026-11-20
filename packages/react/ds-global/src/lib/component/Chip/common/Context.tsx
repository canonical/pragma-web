import { createContext } from "react";
import type { ChipContextValue } from "./types.js";

/**
 * What a chip shares with its dismiss control: the control's default
 * accessible name, built from the chip's lead and value.
 */
const Context = createContext<ChipContextValue | null>(null);

export default Context;
