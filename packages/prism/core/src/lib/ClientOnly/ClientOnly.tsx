import { type ReactElement, useEffect, useState } from "react";
import type { ClientOnlyProps } from "./types.js";

/**
 * Defers `children` until after hydration, so they render only in the browser.
 *
 * The server (and React's first client pass, so hydration stays
 * mismatch-free) renders `fallback`; the mount effect then flips to
 * `children`. Use this for content that must not run during server
 * rendering, such as a component that reads a browser-only API on render.
 *
 * It renders no element of its own (a fragment), so it takes no native props.
 *
 * `import { ClientOnly } from "@canonical/prism-core";`
 */
export default function ClientOnly({
  children,
  fallback = null,
}: ClientOnlyProps): ReactElement {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return <>{isMounted ? children : fallback}</>;
}
