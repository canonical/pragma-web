import type { Completion } from "../src/lib/result/index.js";

/**
 * A request the source accepted and could not complete.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function buildFailedResult<TRow extends object>(
  reason: string,
): Extract<Completion<TRow>, { readonly status: "failed" }> {
  return {
    status: "failed",
    failure: { reason, cause: new Error(reason), transient: null },
  };
}
