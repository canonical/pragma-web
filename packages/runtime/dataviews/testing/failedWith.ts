import type { Completion } from "../src/lib/result/index.js";

/** A request the source accepted and could not complete. */
export default function failedWith<TRow extends object>(
  reason: string,
): Extract<Completion<TRow>, { readonly status: "failed" }> {
  return {
    status: "failed",
    failure: { reason, cause: new Error(reason), transient: null },
  };
}
