import composeClause from "./composeClause.js";

/**
 * A status and its reason as one sentence. A blank reason says nothing: the
 * plain statement, not a bare colon.
 */
export default function composeStatus(
  statement: string,
  reason: string,
): string {
  const clause = composeClause(reason);
  return clause === "" ? `${statement}.` : `${statement}: ${clause}.`;
}
