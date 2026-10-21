import type { Element, Root } from "hast";
import { toString as getText } from "hast-util-to-string";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { remarkPreset, sanitizedRehypePreset } from "../presets/index.js";
import { HEADING_DEPTHS } from "./constants.js";
import type { Heading } from "./types.js";

/**
 * The pipeline `Markdown` runs, up to the HTML syntax tree. Raw HTML is
 * carried through and then removed by the sanitiser, exactly as when
 * rendering, so a heading written in raw HTML is not listed, just as it is not
 * rendered.
 */
const processor = unified()
  .use(remarkParse)
  .use([...remarkPreset])
  .use(remarkRehype, { allowDangerousHtml: true })
  .use([...sanitizedRehypePreset])
  .freeze();

/** Tell whether an element's tag is one of the six heading tags. */
function isHeadingTag(tagName: string): tagName is keyof typeof HEADING_DEPTHS {
  return Object.hasOwn(HEADING_DEPTHS, tagName);
}

/**
 * List a Markdown document's headings, in document order, with the ids they
 * are rendered with.
 *
 * Use it to build a table of contents whose links point at the headings
 * `Markdown` renders: the ids match whether the document is rendered
 * sanitised or not, and match the ids compiled MDX gives the same headings.
 * Only headings written in the source are listed; the "Footnotes" heading
 * GitHub-flavoured Markdown generates for footnotes is not.
 */
export default function extractHeadings(source: string): readonly Heading[] {
  const tree: Root = processor.runSync(processor.parse(source));
  const headings: Heading[] = [];

  visit(tree, "element", (element: Element) => {
    if (!isHeadingTag(element.tagName) || element.position === undefined) {
      return;
    }
    const { id } = element.properties;
    /* v8 ignore start -- rehype-slug gives every heading a string id, and the
       source cannot carry one of its own past the sanitiser */
    if (typeof id !== "string") {
      throw new Error(`Heading <${element.tagName}> has no id`);
    }
    /* v8 ignore stop */
    headings.push({
      depth: HEADING_DEPTHS[element.tagName],
      id,
      text: getText(element),
    });
  });

  return headings;
}
