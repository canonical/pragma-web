import { useMemo } from "react";
import type { UseProviderStateProps, UseProviderStateResult } from "./types.js";

/**
 * The renderers context's value: the site's defaults, and the facts its
 * renderers read, kept stable while the props are.
 *
 * @param props - The provider's defaults and extensions.
 * @returns The context's value.
 */
export default function useProviderState({
  defaults,
  extensions,
}: UseProviderStateProps): UseProviderStateResult {
  return useMemo(
    () => ({ defaults, facts: { extensions: new Set(extensions) } }),
    [defaults, extensions],
  );
}
