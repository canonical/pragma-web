import type { QueryCommand } from "../query/index.js";
import type { QueryIssue } from "../result/index.js";

/**
 * Whether a command addresses a refused clause, and so replaces it: a
 * predicate set, added or removed on the clause's field, an edit removing
 * or adding a conjunct on it, the search set for a refused `q`, or a clear
 * emptying the part the clause is in — the filter for every filter's
 * clause, the search for `q`. Every other command leaves the clause
 * standing.
 */
export default function isClauseReplaced(
  command: QueryCommand,
  issue: QueryIssue,
): boolean {
  switch (command.kind) {
    case "setPredicate":
    case "addPredicate":
      return command.predicate.field === issue.field;
    case "removePredicate":
      return command.field === issue.field;
    case "editPredicates":
      return (
        command.remove.some((ref) => ref.field === issue.field) ||
        command.add.some((predicate) => predicate.field === issue.field)
      );
    case "setSearch":
      return issue.field === null;
    case "clear":
      return command.paths.includes(issue.field === null ? "search" : "filter");
    default:
      return false;
  }
}
