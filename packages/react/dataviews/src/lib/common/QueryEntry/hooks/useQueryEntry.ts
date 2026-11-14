import { useContext } from "react";
import Context from "../Context.js";
import type { UseQueryEntryResult } from "./types.js";

/**
 * Reads the combobox host that drives the query entry, if any.
 *
 * @returns The host's `getInputProps`, or `undefined` without a provider.
 */
const useQueryEntry = (): UseQueryEntryResult => useContext(Context);

export default useQueryEntry;
