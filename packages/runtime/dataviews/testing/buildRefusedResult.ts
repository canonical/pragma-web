import type { Completion } from "../src/lib/result/index.js";

/** A request the source run refused before executing it, once per reason. */
export default function buildRefusedResult<TRow extends object>(
  ...reasons: readonly string[]
): Extract<Completion<TRow>, { readonly status: "refused" }> {
  return {
    status: "refused",
    refusals: reasons.map((reason) => ({
      part: "sort",
      code: "undeclared-field",
      field: "name",
      operator: null,
      reason,
    })),
  };
}
