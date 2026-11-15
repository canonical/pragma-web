import type { QueryCommand } from "../query/index.js";
import type { QueryIssue } from "../result/index.js";

/**
 * Whether a command addresses a refused clause, and so replaces it: a
 * predicate set or removed on the clause's field, or the search set for a
 * refused `q`. Every other command leaves the clause standing.
 */
export default function isClauseReplaced(
  command: QueryCommand,
  issue: QueryIssue,
): boolean {
  switch (command.kind) {
    case "setPredicate":
      return command.predicate.field === issue.field;
    case "removePredicate":
      return command.field === issue.field;
    case "setSearch":
      return issue.field === null;
    default:
      return false;
  }
}
