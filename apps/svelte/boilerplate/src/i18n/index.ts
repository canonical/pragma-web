import {
  createTranslator,
  type LocaleSource,
  type Messages,
} from "@canonical/i18n-core";
import { getContext } from "svelte";
import { ar } from "./ar";
import { en } from "./en";
import { fr } from "./fr";

export { config } from "./config";

export const localeKey = Symbol("locale");

const catalogs: Record<string, Messages> = { en, fr, ar };

/** Reads the locale source the root layout provides. */
export function getLocaleSource() {
  return getContext<LocaleSource>(localeKey);
}

/** Creates the translator for `locale`, falling back to English. */
export function getTranslator(locale: string) {
  return createTranslator(locale, catalogs[locale] ?? catalogs.en);
}
