import type { QueryCommand } from "../query/index.js";
import type { TransitionCause } from "./types.js";

/**
 * The cause one command announces its transition with, which is how the
 * history policy reads it: every predicate command moves the filter, a
 * clear the filter when it empties the filter and the search otherwise,
 * and each other command the member it is named for. Pure.
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
    case "clear":
      return command.paths.includes("filter") ? "filter" : "search";
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
