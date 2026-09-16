import { useEffect, useRef } from "react";
import { RENDER_CEILING } from "./constants.js";
import type { UseRenderCeilingProps, UseRenderCeilingResult } from "./types.js";

/**
 * What each renderer draws, as the warning counts it, and what it says to
 * do about drawing fewer: the table points to its virtualization entry
 * point, and the cards, which have none, say so rather than send the reader
 * to one that does not exist.
 */
const RENDERERS = {
  DataTable: {
    unit: "rows",
    remedy:
      "Measure it, and consider `virtualizeRows` from `@canonical/dataviews-react/virtualization`, which mounts only the rows in view.",
  },
  Cards: {
    unit: "cards",
    remedy: "Measure it: this renderer has no virtualization to opt into.",
  },
} as const;

/** English's own grouping of a count, so a large one reads as one number. */
const COUNT = new Intl.NumberFormat("en");

/**
 * Whether this is a production build. Spelled as the token bundlers replace
 * with a literal; where nothing replaced it and no `process` exists — a
 * browser serving the source as written — the read throws, and that is
 * development.
 */
const isProduction = (): boolean => {
  try {
    return process.env.NODE_ENV === "production";
  } catch {
    return false;
  }
};

/**
 * Warn, in development, when a renderer draws more rows than the ceiling
 * without virtualization: a prompt to measure, never a cap.
 *
 * Said once per mount, the first time the count passes the ceiling, and
 * never in a production build, nor where the renderer already virtualizes.
 *
 * @note Impure by design: it writes to the console, which is its purpose.
 */
export default function useRenderCeiling({
  renderer,
  count,
  virtualized,
}: UseRenderCeilingProps): UseRenderCeilingResult {
  const warned = useRef(false);
  useEffect(() => {
    if (
      warned.current ||
      count <= RENDER_CEILING ||
      virtualized ||
      isProduction()
    ) {
      return;
    }
    warned.current = true;
    const { unit, remedy } = RENDERERS[renderer];
    console.warn(
      `${renderer} renders ${COUNT.format(count)} ${unit} at once, past the ${COUNT.format(RENDER_CEILING)} the package warns at. ${remedy} Every one is still rendered.`,
    );
  }, [renderer, count, virtualized]);
}
