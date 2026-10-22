import { defaultUrlTransform, type UrlTransform } from "react-markdown";
import { URL_SCHEME_PATTERN } from "./constants.js";

/**
 * Create the URL transform that lets a link keep an `href` in one of the
 * named schemes. Every other URL, an image's `src` included, goes through
 * react-markdown's default transform, which empties any URL whose scheme is
 * not `http`, `https`, `irc`, `ircs`, `mailto` or `xmpp`.
 *
 * The schemes are taken as given: assert them with `assertLinkSchemes`
 * first.
 *
 * @param linkSchemes - The schemes an `href` may keep, without their colon.
 * @returns The transform to hand react-markdown as `urlTransform`.
 */
export default function createLinkUrlTransform(
  linkSchemes: readonly string[],
): UrlTransform {
  const kept = new Set(linkSchemes);
  return (url, key) => {
    const scheme = url.match(URL_SCHEME_PATTERN)?.at(1);
    return key === "href" && scheme !== undefined && kept.has(scheme)
      ? url
      : defaultUrlTransform(url);
  };
}
