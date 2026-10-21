/**
 * The unified plugin lists every renderer in this package runs, and the
 * sanitising schema they share. They live together because `Markdown`, the
 * MDX preset and `extractHeadings` must agree on all of them: a heading id
 * computed by one is only useful if every other one computes the same.
 */
import rehypeSanitize, {
  defaultSchema,
  type Options as SanitizeOptions,
} from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import type { Pluggable } from "unified";
import { ADMONITION_KINDS, remarkAdmonitions } from "../admonitions/index.js";

/**
 * The prefix every heading id carries: `# Hello world` gets the id
 * `user-content-hello-world`.
 *
 * Markdown is often written by someone other than the page's author, so its
 * ids share a namespace with nothing on the page. `user-content-` is the
 * prefix GitHub uses for rendered content and the one GFM footnote ids carry.
 * A hyphenated id is never exposed as a bare global variable, so a heading
 * cannot clobber a global the page's scripts rely on. Slugging runs after
 * sanitising with this fixed prefix, so a heading has the same id whether the
 * document was sanitised or not, and whether it was rendered from Markdown or
 * compiled from MDX.
 */
export const HEADING_ID_PREFIX = "user-content-";

/**
 * The remark (Markdown syntax tree) plugins: GitHub-flavoured Markdown
 * (tables, task lists, strikethrough, autolinks, footnotes) and GitHub-style
 * admonitions (`> [!NOTE]`).
 */
export const remarkPreset: readonly Pluggable[] = [
  remarkGfm,
  remarkAdmonitions,
];

/**
 * The rehype (HTML syntax tree) plugins: an `id` on every heading, slugged
 * from its text and prefixed with `HEADING_ID_PREFIX`. Duplicate headings get
 * `-1`, `-2`, … suffixes in document order.
 */
export const rehypePreset: readonly Pluggable[] = [
  [rehypeSlug, { prefix: HEADING_ID_PREFIX }],
];

/**
 * The sanitising schema: rehype-sanitize's default, GitHub-like schema, which
 * also lets a `<blockquote>` keep a `data-admonition` attribute naming one of
 * the five admonition kinds. Any other value of that attribute is removed.
 *
 * Unlike the default schema, it prefixes no `id` or `aria-*` reference with
 * `user-content-`. The only ids in a sanitised tree are the ones Markdown
 * generates, because raw HTML is removed: GFM footnote ids, which already
 * carry `user-content-`, and the fixed id of the footnotes label. Prefixing
 * them a second time would leave every footnote link pointing at an id that
 * no longer exists, since links are not rewritten.
 */
export const SANITIZE_SCHEMA: SanitizeOptions = {
  ...defaultSchema,
  clobber: [],
  attributes: {
    ...defaultSchema.attributes,
    blockquote: [
      /* v8 ignore start -- rehype-sanitize's default schema always lists
         blockquote attributes; the fallback guards its optional type */
      ...(defaultSchema.attributes?.blockquote ?? []),
      /* v8 ignore stop */
      ["dataAdmonition", ...ADMONITION_KINDS],
    ],
  },
};

/**
 * `rehypePreset` preceded by the sanitiser. Slugging comes second so the ids
 * it gives headings are never subject to the sanitiser.
 */
export const sanitizedRehypePreset: readonly Pluggable[] = [
  [rehypeSanitize, SANITIZE_SCHEMA],
  ...rehypePreset,
];
