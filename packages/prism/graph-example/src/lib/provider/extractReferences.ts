import type { Nodes } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { REFERENCE_IRI } from "./constants.js";

/** Every node of the tree under `node`, `node` first, in document order. */
const listNodes = (node: Nodes): Nodes[] => [
  node,
  ...("children" in node ? node.children.flatMap(listNodes) : []),
];

/**
 * The destination each link reference definition names, by its normalised
 * label. CommonMark gives a repeated label to its first definition, wherever
 * the definitions sit relative to their uses.
 */
const indexDefinitions = (nodes: readonly Nodes[]): Map<string, string> => {
  const definitions = new Map<string, string>();
  for (const node of nodes) {
    if (node.type === "definition" && !definitions.has(node.identifier)) {
      definitions.set(node.identifier, node.url);
    }
  }
  return definitions;
};

/**
 * The destination of every link in `nodes`, in document order: an inline
 * link's or an autolink's own, and a reference link's through its definition.
 */
const listDestinations = (
  nodes: readonly Nodes[],
  definitions: ReadonlyMap<string, string>,
): string[] =>
  nodes.flatMap((node) => {
    if (node.type === "link") return [node.url];
    if (node.type !== "linkReference") return [];
    const url = definitions.get(node.identifier);
    /* v8 ignore next 3 -- unreachable: the parser emits a linkReference only
       for a label some definition in the same document declares, and every
       definition is indexed above. Kept as a loud failure should a parser
       upgrade ever change that. */
    if (url === undefined) {
      throw new Error(`link reference [${node.label}] has no definition`);
    }
    return [url];
  });

/**
 * `destination` with a declared prefix expanded: `ds:button` becomes the
 * `ds` namespace followed by `button`. A destination whose text before the
 * first colon is not a declared prefix is returned as written, which is
 * what leaves an absolute IRI untouched. Only the map's own keys count, so
 * `constructor:x` does not reach `Object.prototype`.
 */
const expandDestination = (
  destination: string,
  prefixes: Readonly<Record<string, string>>,
): string => {
  const colon = destination.indexOf(":");
  const prefix = destination.slice(0, colon);
  return colon > 0 && Object.hasOwn(prefixes, prefix)
    ? `${prefixes[prefix]}${destination.slice(colon + 1)}`
    : destination;
};

/**
 * The entities a Markdown document links to, as absolute IRIs in order of
 * first mention, each once.
 *
 * The document is parsed as CommonMark, so only what CommonMark reads as a
 * link counts: inline links (`[Button](ds:button)`), autolinks
 * (`<ds:button>`) and reference links in their full, collapsed and shortcut
 * forms, resolved through their definitions. Text that merely looks like a
 * link does not: a link inside a code span or a fenced or indented code
 * block, an escaped bracket, an image, and a raw HTML anchor are not
 * references. Neither is a bare URL, which CommonMark does not link without
 * angle brackets.
 *
 * A destination is either a CURIE whose prefix `prefixes` declares, which is
 * expanded, or an absolute IRI, which is kept verbatim. Anything else with a
 * scheme is kept too, since only the graph can say whether it names an
 * entity; a destination with no scheme (a relative path, a fragment) cannot
 * name one and is dropped.
 *
 * @param markdown - The CommonMark document.
 * @param prefixes - Prefix to namespace IRI.
 * @returns The candidate IRIs, deduplicated, in document order.
 */
export const extractReferences = (
  markdown: string,
  prefixes: Readonly<Record<string, string>>,
): string[] => {
  const nodes = listNodes(fromMarkdown(markdown));
  const destinations = listDestinations(nodes, indexDefinitions(nodes))
    .map((destination) => expandDestination(destination, prefixes))
    .filter((destination) => REFERENCE_IRI.test(destination));
  return [...new Set(destinations)];
};
