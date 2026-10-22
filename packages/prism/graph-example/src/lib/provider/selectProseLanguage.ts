import { DEFAULT_LANG } from "./constants.js";
import type { ProseTexts } from "./types.js";

/**
 * The language to serve an entity's prose in: the first preference it is
 * authored in, else the default language, which every entity with prose is
 * authored in.
 *
 * A preference matches only an authored language exactly. There is no
 * subtag fallback: a request for `fr-CA` is not served `fr`.
 *
 * @param texts - The entity's prose, by language tag.
 * @param preferences - Language tags, most preferred first; `undefined`
 * entries stand for "no preference here" and are skipped.
 * @returns An authored language tag.
 */
export const selectProseLanguage = (
  texts: ProseTexts,
  preferences: readonly (string | undefined)[],
): string =>
  preferences.find(
    (lang) => lang !== undefined && Object.hasOwn(texts, lang),
  ) ?? DEFAULT_LANG;
