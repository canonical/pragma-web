import type { NetworkMapQuery$variables } from "../../relay/__generated__/NetworkMapQuery.graphql.js";
import { LINE_CLASS_URI, LINE_PAGE_SIZE } from "./constants.js";

/**
 * Build the map query's variables: the line class and a page holding every
 * line. The route warms and the map reads through this one builder, so the
 * variables are identical everywhere and the warm store fulfils every read.
 *
 * @returns The operation's variables.
 */
export default function buildNetworkMapVariables(): NetworkMapQuery$variables {
  return { classUri: LINE_CLASS_URI, first: LINE_PAGE_SIZE };
}
