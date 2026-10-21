import { PROPERTY_KIND_MESSAGES } from "./constants.js";
import type { Translate } from "./i18n/index.js";

/** Whether `kind` is one the catalog names. */
const isCatalogedKind = (
  kind: string,
): kind is keyof typeof PROPERTY_KIND_MESSAGES =>
  Object.hasOwn(PROPERTY_KIND_MESSAGES, kind);

/**
 * Name a property's kind (`OBJECT`, `DATATYPE`, `ANNOTATION`) in the
 * translator's language. A kind the provider sends that the contract did not
 * define when the catalog was written has no message, so it reads as the
 * provider's value, lowercased, rather than failing the render.
 */
export default function formatPropertyKind(kind: string, t: Translate): string {
  return isCatalogedKind(kind)
    ? t(PROPERTY_KIND_MESSAGES[kind])
    : kind.toLowerCase();
}
