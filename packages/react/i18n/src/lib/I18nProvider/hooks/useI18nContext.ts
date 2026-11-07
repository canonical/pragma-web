import { useContext } from "react";
import Context from "../Context.js";
import type { UseI18nContextResult } from "./types.js";

/**
 * Read the i18n context, throwing when used outside an `I18nProvider` so
 * consumers fail fast instead of silently rendering untranslated content.
 */
export default function useI18nContext(): UseI18nContextResult {
  const value = useContext(Context);

  if (!value) {
    throw new Error("I18nProvider is required to use i18n-react hooks.");
  }

  return value;
}
