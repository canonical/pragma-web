import { createElement, useContext } from "react";
import ProjectionsContext from "../../../projections/Context.js";
import ProjectionPeek from "../ProjectionPeek.js";
import type { UseProjectionPeekResult } from "./types.js";

/**
 * Return the peek a chip arm hands its chip for the node at `uri`: the
 * site's own peek when the nearest `ProjectionsProvider` carries one, the
 * package's `ProjectionPeek` when it does not. An arm therefore imports no
 * peek of its site, so no arm depends on the switch its site's peek
 * renders.
 *
 * Every chip arm passes `peek={useProjectionPeek(data.uri)}`.
 * A peek that renders nothing for that IRI shows nothing: the chip's peek
 * is not displayed while it holds no content, so no empty frame or dialog
 * appears.
 *
 * @param uri - The node's absolute IRI (`Node.uri`), the only address
 *   `node(id:)` accepts.
 * @returns The peek element, mounted by the chip only while it is open.
 * @throws When no `ProjectionsProvider` is mounted above: that is a wiring
 *   bug, not a site without peeks.
 * @note Impure: reads the projection provider in scope.
 */
export default function useProjectionPeek(
  uri: string,
): UseProjectionPeekResult {
  const projections = useContext(ProjectionsContext);
  if (projections === undefined) {
    throw new Error("useProjectionPeek: no ProjectionsProvider above");
  }
  return projections.peek === undefined
    ? createElement(ProjectionPeek, { uri })
    : projections.peek(uri);
}
