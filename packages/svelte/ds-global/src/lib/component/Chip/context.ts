import { createContext } from "svelte";
import type { ChipContext } from "./types.js";

export const [getChipContext, setChipContext] = createContext<ChipContext>();
