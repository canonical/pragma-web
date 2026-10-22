import rehypeSanitize from "rehype-sanitize";
import type { Pluggable } from "unified";
import {
  rehypePreset,
  SANITIZE_SCHEMA,
  sanitizedRehypePreset,
} from "./constants.js";

/**
 * Build `sanitizedRehypePreset` with a sanitiser that also lets a link keep
 * an `href` in each of the named schemes, beside the schemes
 * `SANITIZE_SCHEMA` already allows. With no scheme named, it is
 * `sanitizedRehypePreset` itself.
 *
 * The schemes are taken as given: assert them with `assertLinkSchemes`
 * first.
 *
 * @param linkSchemes - The extra schemes an `href` may keep, without their
 *   colon.
 * @returns The rehype plugins, the sanitiser first.
 */
export default function buildSanitizedRehypePreset(
  linkSchemes: readonly string[],
): readonly Pluggable[] {
  if (linkSchemes.length === 0) return sanitizedRehypePreset;
  const schema = {
    ...SANITIZE_SCHEMA,
    protocols: {
      ...SANITIZE_SCHEMA.protocols,
      href: [
        /* v8 ignore start -- the schema spreads rehype-sanitize's default,
           which always lists href protocols; the fallback guards its
           optional type */
        ...(SANITIZE_SCHEMA.protocols?.href ?? []),
        /* v8 ignore stop */
        ...linkSchemes,
      ],
    },
  };
  return [[rehypeSanitize, schema], ...rehypePreset];
}
