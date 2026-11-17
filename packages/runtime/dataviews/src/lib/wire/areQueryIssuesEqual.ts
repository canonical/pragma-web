import { areListsEqual } from "../query/index.js";
import type { QueryIssue } from "../result/index.js";

/**
 * Whether two lists of refused parameters say the same thing: the same
 * parameters, fields, codes and reasons, in the same order.
 */
export default function areQueryIssuesEqual(
  a: readonly QueryIssue[],
  b: readonly QueryIssue[],
): boolean {
  return areListsEqual(
    a,
    b,
    (issue, other) =>
      issue.parameter === other.parameter &&
      issue.field === other.field &&
      issue.code === other.code &&
      issue.reason === other.reason,
  );
}
