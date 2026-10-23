import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  type Edge,
  type Node,
  PLACEHOLDER_SEGMENTS,
  parseAnatomyYAML,
  parseStyleValue,
  type Specification,
  STYLE_KEYS,
  type Style,
} from "@canonical/anatomy-dsl";
import { parseDocument } from "yaml";
import { CARDINALITY, UNTHEMABLE_DECLARATIONS } from "./constants.js";
import nameComponent from "./nameComponent.js";
import readStyleValue from "./readStyleValue.js";

/**
 * List every node of an anatomy, the root first, a switch's cases included.
 */
function listNodes(node: Node): Node[] {
  return [node, ...(node.edges ?? []).flatMap(listEdgeNodes)];
}

/** List the nodes an edge reaches: its node, or every case of its switch. */
function listEdgeNodes(edge: Edge): Node[] {
  const { target } = edge;
  if ("cases" in target) {
    return target.cases.flatMap(({ node }) => listNodes(node));
  }
  return listNodes(target);
}

/**
 * Describe what is wrong with one style, or `undefined` when nothing is: the
 * key must be in the DSL's closed roster, no symbol may be a placeholder,
 * and a key that only takes a token must hold a symbol, save a zero or an
 * unthemable literal, which hold no design decision.
 */
function describeStyleProblem(style: Style): string | undefined {
  const entry = STYLE_KEYS[style.key];
  if (entry === undefined) {
    return `"${style.key}" is not a style key`;
  }
  const placeholder = style.symbols.find((symbol) =>
    symbol
      .split(".")
      .some((segment) => PLACEHOLDER_SEGMENTS.includes(segment.toLowerCase())),
  );
  if (placeholder !== undefined) {
    return `"${style.key}" holds the placeholder "${placeholder}"`;
  }
  if (entry.valueKind === "token" && style.symbols.length === 0) {
    const elements = parseStyleValue(readStyleValue(style)).elements;
    const literal = elements.at(0)?.text ?? "";
    const neutral =
      /^-?0(?:\.0+)?[a-z%]*$/.test(literal) ||
      UNTHEMABLE_DECLARATIONS.includes(literal);
    if (!neutral) {
      return `"${style.key}" takes a token and holds the literal "${style.value}"`;
    }
  }
  return undefined;
}

/**
 * Read a component's `anatomy.yaml` and assert it is a well-formed anatomy
 * of that component: it parses as one YAML document with no syntax error
 * and through the DSL's own `parseAnatomyYAML`, which rejects any value the
 * value grammar refuses; its root is a named node whose URI ends in the
 * folder's name in snake_case; every style key is in the DSL's closed
 * roster; no symbol is a placeholder; a key that only takes a token never
 * holds a design literal; and every edge states its cardinality.
 *
 * @param folder - The component's folder.
 * @returns The parsed anatomy.
 * @throws With every problem found, one per line.
 * @note Impure: reads the anatomy from the file system.
 */
export default function assertAnatomy(folder: string): Specification {
  const { snake } = nameComponent(folder);
  const file = join(folder, "anatomy.yaml");
  const text = readFileSync(file, "utf8");
  const document = parseDocument(text);
  const syntaxError = document.errors.at(0);
  if (syntaxError !== undefined) {
    throw new Error(`${file}: ${syntaxError.message}`);
  }
  if (!text.startsWith("---\n")) {
    throw new Error(`${file}: an anatomy opens with the document marker`);
  }
  const specification = parseAnatomyYAML(text);
  const { root } = specification;
  const problems = [
    ...(root.uri.split(".").at(-1) === snake
      ? []
      : [`the root URI "${root.uri}" does not end in "${snake}"`]),
    ...listNodes(root).flatMap((node) =>
      (node.styles ?? []).flatMap((style) => {
        const problem = describeStyleProblem(style);
        return problem === undefined ? [] : [problem];
      }),
    ),
    ...listNodes(root)
      .flatMap((node) => node.edges ?? [])
      .flatMap((edge) =>
        CARDINALITY.test(String(edge.relation.cardinality))
          ? []
          : [`an edge has no cardinality (slot "${edge.relation.slotName}")`],
      ),
  ];
  if (problems.length > 0) {
    throw new Error(`${file}:\n${problems.join("\n")}`);
  }
  return specification;
}
