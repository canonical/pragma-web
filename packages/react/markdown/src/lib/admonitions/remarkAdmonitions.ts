import type { Blockquote, Root } from "mdast";
import { visit } from "unist-util-visit";
import { ADMONITION_MARKER } from "./constants.js";

/**
 * Mark a blockquote as an admonition when it opens with a `[!KIND]` marker,
 * removing the marker from its content.
 *
 * The marker's text node is trimmed, and dropped when nothing else is left in
 * it, together with the hard break that trailing spaces or a backslash after
 * the marker produce; the opening paragraph is dropped when the marker was all
 * it held. The kind is recorded as the `dataAdmonition` property of the
 * blockquote's hast element, so it reaches the renderer as a `data-admonition`
 * attribute.
 *
 * @note Mutates `blockquote` in place: unified transformers edit the tree they
 * are handed rather than return a copy.
 */
function markAdmonition(blockquote: Blockquote): void {
  const paragraph = blockquote.children.at(0);
  if (paragraph?.type !== "paragraph") return;
  const text = paragraph.children.at(0);
  if (text?.type !== "text") return;
  const match = ADMONITION_MARKER.exec(text.value);
  if (match === null) return;

  const [marker, kind] = match;
  text.value = text.value.slice(marker.length);
  if (text.value === "") {
    paragraph.children.shift();
    if (paragraph.children.at(0)?.type === "break") paragraph.children.shift();
  }
  if (paragraph.children.length === 0) blockquote.children.shift();

  blockquote.data = {
    ...blockquote.data,
    hProperties: {
      ...blockquote.data?.hProperties,
      dataAdmonition: kind.toLowerCase(),
    },
  };
}

/**
 * A unified plugin that turns GitHub-style admonitions into marked
 * blockquotes.
 *
 * A blockquote whose first line is exactly `[!NOTE]`, `[!TIP]`,
 * `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]` (any case) becomes an
 * admonition: the marker is removed and the kind is carried to the rendered
 * `<blockquote>` as `data-admonition`. Every other blockquote is left as it is.
 *
 * @note The returned transformer mutates the mdast tree it is given, which is
 * how unified transformers work.
 */
export default function remarkAdmonitions(): (tree: Root) => void {
  return (tree) => {
    visit(tree, "blockquote", markAdmonition);
  };
}
