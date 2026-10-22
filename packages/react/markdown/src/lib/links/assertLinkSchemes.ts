import { LINK_SCHEME_PATTERN, REFUSED_LINK_SCHEMES } from "./constants.js";

/**
 * Assert that every scheme a consumer asks links to keep is one a link may
 * keep: written as a URL scheme, in lower case, and not one of
 * `REFUSED_LINK_SCHEMES`.
 *
 * @param linkSchemes - The schemes, without their colon (`ds`, not `ds:`).
 * @throws When a scheme is refused or is not written as a lower-case URL
 *   scheme.
 */
export default function assertLinkSchemes(
  linkSchemes: readonly string[],
): void {
  for (const scheme of linkSchemes) {
    if (!LINK_SCHEME_PATTERN.test(scheme)) {
      throw new Error(
        `"${scheme}" is not a lower-case URL scheme; name a scheme without its colon, such as "ds"`,
      );
    }
    if (REFUSED_LINK_SCHEMES.some((refused) => refused === scheme)) {
      throw new Error(`links in the "${scheme}" scheme are never kept`);
    }
  }
}
