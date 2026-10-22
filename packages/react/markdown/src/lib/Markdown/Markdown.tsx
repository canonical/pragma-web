import type { ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import { defaultComponents } from "../elements/index.js";
import { assertLinkSchemes, createLinkUrlTransform } from "../links/index.js";
import {
  buildSanitizedRehypePreset,
  rehypePreset,
  remarkPreset,
} from "../presets/index.js";
import type { MarkdownProps } from "./types.js";

/**
 * Render a Markdown document through design-system elements.
 *
 * The document is parsed as GitHub-flavoured Markdown with admonitions, its
 * headings get `user-content-` ids, and it is sanitised unless `sanitize` is
 * `false`. A link keeps its `href` when the URL is relative or its scheme is
 * `http`, `https`, `irc`, `ircs`, `mailto`, `xmpp` or one of `linkSchemes`;
 * any other `href` is dropped. Rendering is synchronous, so the same markup
 * comes out of a server render as out of the client.
 *
 * Renders a fragment, with no root element of its own.
 *
 * `import { Markdown } from "@canonical/react-markdown";`
 *
 * @throws When `linkSchemes` names a refused scheme (`javascript`,
 *   `vbscript`, `data`, `file`) or one not written as a lower-case URL
 *   scheme.
 */
export default function Markdown({
  source,
  components = defaultComponents,
  sanitize = true,
  linkSchemes = [],
}: MarkdownProps): ReactElement {
  assertLinkSchemes(linkSchemes);
  return (
    <ReactMarkdown
      remarkPlugins={[...remarkPreset]}
      rehypePlugins={[
        ...(sanitize ? buildSanitizedRehypePreset(linkSchemes) : rehypePreset),
      ]}
      urlTransform={createLinkUrlTransform(linkSchemes)}
      components={components}
    >
      {source}
    </ReactMarkdown>
  );
}
