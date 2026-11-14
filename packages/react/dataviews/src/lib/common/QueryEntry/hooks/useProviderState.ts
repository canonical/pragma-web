import { useMemo } from "react";
import type { UseProviderStateProps, UseProviderStateResult } from "./types.js";

/**
 * Holds the query entry provider's state: the host's props merger.
 *
 * @param props - The host's `getInputProps`.
 * @returns The context value, stable while the merger is.
 */
const useProviderState = ({
  getInputProps,
}: UseProviderStateProps): UseProviderStateResult =>
  useMemo(() => ({ getInputProps }), [getInputProps]);

export default useProviderState;
