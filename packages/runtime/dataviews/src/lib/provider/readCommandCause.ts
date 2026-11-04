import type { QueryCommand } from "../query/index.js";
import type { TransitionCause } from "./types.js";

/**
 * The cause one command announces its transition with, which is how the
 * history policy reads it: every predicate command moves the filter, and
 * each other command the member it is named for. Pure.
 */
export default function readCommandCause(
  command: QueryCommand,
): TransitionCause {
  switch (command.kind) {
    case "setPredicate":
    case "removePredicate":
    case "editPredicates":
      return "filter";
    case "setSearch":
      return "search";
    case "setSort":
      return "sort";
    case "setGroup":
      return "group";
    case "setCollapsed":
      return "collapse";
    case "navigateWindow":
      return "window";
  }
}
