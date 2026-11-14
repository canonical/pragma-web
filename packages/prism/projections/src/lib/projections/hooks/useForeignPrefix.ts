import { useContext } from "react";
import { findCuriePrefix } from "../../utils/index.js";
import AmbientNamespaceContext from "../AmbientNamespaceContext.js";
import type { UseForeignPrefixResult } from "./types.js";

/**
 * Return the prefix an identity shows for the node at `curie`: its
 * namespace prefix with its colon (`cs:`) when that namespace differs from
 * the page's ambient one, which the nearest `AmbientNamespaceProvider`
 * declares, and nothing when it is the same (heuristic 4.3). Where no
 * page declares one, every prefix shows. A node whose address did not
 * compact has no prefix to show.
 *
 * Every arm passes `prefix={useForeignPrefix(curie)}` to its form.
 *
 * @param curie - The node's compact address, `_meta.curie`.
 * @returns The prefix with its colon, or `undefined` when it is the
 *   page's own or there is none.
 * @note Impure: reads the ambient namespace in scope.
 */
export default function useForeignPrefix(
  curie: string,
): UseForeignPrefixResult {
  const ambient = useContext(AmbientNamespaceContext);
  const prefix = findCuriePrefix(curie);
  return prefix === undefined || prefix === ambient ? undefined : `${prefix}:`;
}
