import type { ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import { defaultComponents } from "../elements/index.js";
import {
  rehypePreset,
  remarkPreset,
  sanitizedRehypePreset,
} from "../presets/index.js";
import type { MarkdownProps } from "./types.js";

/**
 * Render a Markdown document through design-system elements.
 *
 * The document is parsed as GitHub-flavoured Markdown with admonitions, its
 * headings get `user-content-` ids, and it is sanitised unless `sanitize` is
 * `false`. Rendering is synchronous, so the same markup comes out of a server
 * render as out of the client.
 *
 * Renders a fragment, with no root element of its own.
 *
 * `import { Markdown } from "@canonical/react-markdown";`
 */
export default function Markdown({
  source,
  components = defaultComponents,
  sanitize = true,
}: MarkdownProps): ReactElement {
  return (
    <ReactMarkdown
      remarkPlugins={[...remarkPreset]}
      rehypePlugins={[...(sanitize ? sanitizedRehypePreset : rehypePreset)]}
      components={components}
    >
      {source}
    </ReactMarkdown>
  );
}
