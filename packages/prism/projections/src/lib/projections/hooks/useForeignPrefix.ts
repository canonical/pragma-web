import { useContext } from "react";
import { PREFIX_NAME } from "../../utils/constants.js";
import { findCuriePrefix } from "../../utils/index.js";
import AmbientNamespaceContext from "../AmbientNamespaceContext.js";
import type { ForeignPrefixSource, UseForeignPrefixResult } from "./types.js";

/**
 * Return the prefix an identity shows for a node: its namespace prefix
 * with its colon (`cs:`) when that namespace differs from the page's
 * ambient one, which the nearest `AmbientNamespaceProvider` declares, and
 * nothing when it is the same (heuristic 4.3). Where no page declares
 * one, every prefix shows.
 *
 * It takes the node's compact address, `_meta.curie`, whose prefix it
 * reads: an address that did not compact has none to show. An entity
 * with no `_meta`, such as an ontology property, gives its namespace
 * instead, `{ namespace }`: a prefix name is its prefix, and a namespace
 * served as an IRI has none to show.
 *
 * Every arm that passes a prefix passes `prefix={useForeignPrefix(curie)}`,
 * or `prefix={useForeignPrefix({ namespace })}`, to its form.
 *
 * @param source - The node's compact address, or its namespace.
 * @returns The prefix with its colon, or `undefined` when it is the
 *   page's own or there is none.
 * @note Impure: reads the ambient namespace in scope.
 */
export default function useForeignPrefix(
  source: ForeignPrefixSource,
): UseForeignPrefixResult {
  const ambient = useContext(AmbientNamespaceContext);
  const prefix =
    typeof source === "string"
      ? findCuriePrefix(source)
      : readPrefixName(source.namespace);
  return prefix === undefined || prefix === ambient ? undefined : `${prefix}:`;
}

/** The namespace as a prefix name, or `undefined` when it is an IRI. */
function readPrefixName(namespace: string): string | undefined {
  return PREFIX_NAME.test(namespace) ? namespace : undefined;
}
