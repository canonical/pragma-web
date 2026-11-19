import { useContext } from "react";
import Context from "../Context.js";
import type { UseRovingStopResult } from "./types.js";

/**
 * Reads the nearest composite's roving stop, for a component that holds
 * items: whether it roves at all, which item holds the stop, how to claim
 * it, and how to join the composite as a member.
 *
 * @returns The composite's stop, or `undefined` outside a roving context.
 */
const useRovingStop = (): UseRovingStopResult => useContext(Context);

export default useRovingStop;
