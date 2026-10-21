import { LANGUAGE_TAG, LOCALE_HEADER } from "../provider/index.js";

/**
 * The language a request asks prose to be served in, from its
 * `x-prism-locale` header.
 *
 * A value that is not a language tag (`LANGUAGE_TAG`) counts as no header at
 * all, so a malformed header falls back exactly as a missing one does.
 *
 * @param request - The incoming request.
 * @returns The language tag, or `undefined` when the request names none.
 */
export const readRequestLocale = (request: Request): string | undefined => {
  const value = request.headers.get(LOCALE_HEADER);
  return value !== null && LANGUAGE_TAG.test(value) ? value : undefined;
};
