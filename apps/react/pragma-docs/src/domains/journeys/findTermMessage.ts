import type { MessageKey } from "#i18n";
import { foldTermName, readLocalName } from "./collectJourneys.js";
import { SURFACE_TYPE_MESSAGES } from "./constants.js";

/**
 * Find the message a vocabulary term reads as, by the term's folded local
 * name, in one of the domain's term maps (`ROLE_MESSAGES`,
 * `ARRIVAL_MESSAGES`). A term's local name is the graph's identifier, never
 * a reader's word, so a term the map does not hold finds nothing and is
 * left unsaid.
 *
 * @param messages - The term map to look in, keyed by folded local name.
 * @param uri - The term's URI, full or prefixed; absent when the pairing
 *   carries none.
 * @returns The term's message key, or undefined.
 */
export const findTermMessage = (
  messages: ReadonlyMap<string, MessageKey>,
  uri: string | null | undefined,
): MessageKey | undefined =>
  uri == null ? undefined : messages.get(foldTermName(readLocalName(uri)));

/**
 * Find the message a surface's kind reads as, by the GraphQL type the
 * surface resolves to (`SURFACE_TYPE_MESSAGES`). A type name is the
 * schema's, never a reader's word, so a type the map does not hold finds
 * nothing and is left unsaid.
 *
 * @param typename - The surface's `__typename`; absent when the surface is.
 * @returns The kind's message key, or undefined.
 */
export const findSurfaceTypeMessage = (
  typename: string | null | undefined,
): MessageKey | undefined =>
  typename == null ? undefined : SURFACE_TYPE_MESSAGES.get(typename);
