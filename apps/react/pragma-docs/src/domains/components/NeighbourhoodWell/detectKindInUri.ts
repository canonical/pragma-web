import type { Kind } from "@canonical/prism-core";
import { URI_KINDS } from "./constants.js";

/** Narrows a URI segment to a kind a pragma URI can name. */
const isUriKind = (segment: string): segment is Kind =>
  URI_KINDS.includes(segment as Kind);

/**
 * The kind a pragma URI's local name encodes, when it encodes one: the first
 * interior dot-delimited segment after the tier that names a kind
 * (`ds:global.component.button` → `component`). `undefined` for URIs whose
 * local name asserts no kind (`cs:typescript.imports`).
 *
 * The well trusts it over a relation's default kind: a `subcomponents` edge
 * can legally deliver a pattern, and the shape channel must not lie about
 * it.
 *
 * @param uri - A compact pragma URI.
 * @returns The kind its local name names, if any.
 */
export const detectKindInUri = (uri: string): Kind | undefined =>
  uri
    .slice(uri.lastIndexOf(":") + 1)
    .split(".")
    // Interior segments only: the first is the tier, the last the entity name.
    .slice(1, -1)
    .find(isUriKind);
