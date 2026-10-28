import type { Theme } from "@canonical/react-hooks";
import { useMemo, useState } from "react";
import type { UseProviderStateProps, UseProviderStateResult } from "./types.js";

/**
 * Hold the stored theme for `StoredThemeProvider`: seeded once from the
 * theme the request's cookie stored, then kept current by the theme control
 * through `setTheme`. A control mounted later, such as the one in the next
 * route's rail, so reads the reader's latest choice rather than the
 * request's.
 *
 * @param props - The provider's props: the request's stored theme.
 * @returns The current stored theme and its setter.
 */
export default function useProviderState({
  theme: requestTheme,
}: UseProviderStateProps): UseProviderStateResult {
  const [theme, setTheme] = useState<Theme | undefined>(requestTheme);

  return useMemo(() => ({ theme, setTheme }), [theme]);
}
