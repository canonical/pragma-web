import { useEffect, useRef } from "react";
import { RENDER_CEILING } from "./constants.js";
import type { UseRenderCeilingProps } from "./types.js";

/** English's own grouping of a count, so a large one reads as one number. */
const COUNT = new Intl.NumberFormat("en");

/**
 * Warn, in development, when a renderer draws more rows than the ceiling
 * without virtualization: a prompt to measure, never a cap.
 *
 * Said once per mount, the first time the count passes the ceiling, and
 * never in a production build. The renderer names itself and, where it has a
 * virtualization entry point, points to it; one without says so, so the
 * reader is not sent to an entry point that does not exist.
 *
 * @note Impure by design: it writes to the console, which is its purpose.
 */
export default function useRenderCeiling({
  renderer,
  count,
  virtualization,
}: UseRenderCeilingProps): void {
  const warned = useRef(false);
  useEffect(() => {
    if (
      warned.current ||
      count <= RENDER_CEILING ||
      virtualization === "in-use" ||
      typeof process === "undefined" ||
      process.env["NODE_ENV"] === "production"
    ) {
      return;
    }
    warned.current = true;
    const remedy =
      virtualization === "available"
        ? "Measure it, and consider `virtualizeRows` from `@canonical/dataviews-react/virtualization`, which mounts only the rows in view."
        : "Measure it: this renderer has no virtualization to opt into.";
    console.warn(
      `${renderer} renders ${COUNT.format(count)} rows at once, past the ${COUNT.format(RENDER_CEILING)} the package warns at. ${remedy} Every row is still rendered.`,
    );
  }, [renderer, count, virtualization]);
}
