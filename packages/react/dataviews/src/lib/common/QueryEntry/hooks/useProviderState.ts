import { useMemo } from "react";
import type { UseProviderStateProps, UseProviderStateResult } from "./types.js";

/**
 * Holds the query entry provider's state: the host's props merger.
 *
 * @param props - The host's `getInputProps`.
 * @returns The context value, stable while the merger is.
 */
export default function useProviderState({
  getInputProps,
}: UseProviderStateProps): UseProviderStateResult {
  return useMemo(() => ({ getInputProps }), [getInputProps]);
}
