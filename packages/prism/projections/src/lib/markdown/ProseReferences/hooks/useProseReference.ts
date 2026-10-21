import { useContext } from "react";
import ProseReferencesContext from "../Context.js";
import type {
  UseProseReferenceProps,
  UseProseReferenceResult,
} from "./types.js";

/**
 * Resolve a prose link's href against the page's prose references.
 *
 * @param href - The link's href, an absolute IRI or a compact address.
 * @returns The referenced node's chip key, or `undefined` when the href
 *   names no reference, the link has no href, or no provider is mounted.
 */
export default function useProseReference(
  href: UseProseReferenceProps,
): UseProseReferenceResult {
  const references = useContext(ProseReferencesContext);
  return href === undefined ? undefined : references.get(href);
}
