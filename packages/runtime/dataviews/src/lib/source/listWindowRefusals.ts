import type { ResultWindow } from "../query/index.js";
import type { SourceRefusal } from "../result/index.js";
import createRefusal from "./createRefusal.js";
import type { SourceCapabilities } from "./types.js";

/**
 * List the refusals of a window: collapsed groups a source cannot leave out
 * of a page, and a page token a source paging by number cannot follow.
 */
export default function listWindowRefusals(
  capabilities: SourceCapabilities,
  window: ResultWindow,
): readonly SourceRefusal[] {
  return [
    ...(window.collapsed.length > 0 && !capabilities.group.collapse
      ? [
          createRefusal(
            "window",
            "unsupported-collapse",
            "this source cannot leave collapsed groups out of a page",
          ),
        ]
      : []),
    ...(capabilities.pagination.kind === "offset" && window.cursor !== null
      ? [
          createRefusal(
            "window",
            "unreachable-page",
            "this source pages by number and reaches no page by token",
          ),
        ]
      : []),
  ];
}
