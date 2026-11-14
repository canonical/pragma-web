import { UNTAGGED } from "./constants.js";
import type { LangLiterals } from "./types.js";

/**
 * Whether a literal's language tag is the one asked for: equal ignoring case,
 * never a prefix, so `en` does not match `en-GB`.
 */
const matchesTag = (tag: string, lang: string): boolean =>
  tag !== UNTAGGED && tag.toLowerCase() === lang.toLowerCase();

/**
 * The literal for a language: the one tagged exactly `lang` (compared ignoring
 * case), else the untagged one, else null. With no language, only the
 * untagged literal answers.
 *
 * @param literals - One literal per language tag.
 * @param lang - The language asked for.
 * @returns The literal, or null when neither the tag nor an untagged one exists.
 */
export function selectLiteral(
  literals: LangLiterals,
  lang: string | null | undefined,
): string | null {
  const tag =
    lang === null || lang === undefined
      ? undefined
      : Object.keys(literals).find((key) => matchesTag(key, lang));
  return literals[tag ?? UNTAGGED] ?? null;
}
