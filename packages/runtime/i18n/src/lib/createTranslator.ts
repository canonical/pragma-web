import type { Locale, Messages, PluralCategory, Translator } from "./types.js";

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Create a {@link Translator} bound to one locale and message catalog.
 *
 * Resolution is non-throwing, so a bad key never breaks a render:
 * - a missing key returns the key itself;
 * - `{placeholder}` slots are filled from `vars`; an absent variable is left
 *   verbatim;
 * - a plural entry selects a branch from `vars.count` via `Intl.PluralRules`,
 *   falling back to the required `other` branch.
 *
 * @param locale - BCP 47 tag driving plural selection.
 * @param messages - Catalog for that locale.
 * @deprecated Write a typed message record instead: a factory per locale
 * that takes `createFormatters(locale)` and returns a `MessageRecord`, with
 * `selectPlural` in place of plural entries. Catalogs keep working until a later
 * release removes them.
 */
export default function createTranslator(
  locale: Locale,
  messages: Messages,
): Translator {
  const plural = new Intl.PluralRules(locale);

  return (key, vars = {}) => {
    const entry = Object.hasOwn(messages, key) ? messages[key] : undefined;
    if (entry === undefined) return key;

    let template: string;
    if (typeof entry === "string") {
      template = entry;
    } else {
      const count = Number(vars.count);
      const category: PluralCategory = Number.isFinite(count)
        ? plural.select(count)
        : "other";
      template = entry[category] ?? entry.other;
    }

    return template.replace(PLACEHOLDER, (whole, name: string) =>
      Object.hasOwn(vars, name) ? String(vars[name]) : whole,
    );
  };
}
