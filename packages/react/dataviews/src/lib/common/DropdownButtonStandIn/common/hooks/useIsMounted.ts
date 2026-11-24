import { useEffect, useState } from "react";
import type { UseIsMountedResult } from "./types.js";

/**
 * Reports whether the component has mounted on the client: false on the server
 * and in the first client render.
 *
 * @returns `false` until mounted, then `true`.
 * @note Impure — schedules a mount effect that updates component state.
 */
export default function useIsMounted(): UseIsMountedResult {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
