import { DEFAULT_PROSE_LANG } from "./constants.js";
import type { ProseDocument } from "./types.js";

/**
 * The language to serve a document's prose in: the first preference the
 * document is authored in, else the default language, which every document
 * is authored in.
 *
 * A preference matches only an authored language exactly. There is no
 * subtag fallback: a request for `fr-CA` is not served `fr`.
 *
 * @param document - The prose of one entity.
 * @param preferences - Language tags, most preferred first; `undefined`
 * entries stand for "no preference here" and are skipped.
 * @returns An authored language tag.
 */
export const selectProseLanguage = (
  document: ProseDocument,
  preferences: readonly (string | undefined)[],
): string =>
  preferences.find(
    (lang) => lang !== undefined && Object.hasOwn(document.texts, lang),
  ) ?? DEFAULT_PROSE_LANG;
