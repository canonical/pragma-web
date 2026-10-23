import splitTopLevel from "./splitTopLevel.js";
import stripComments from "./stripComments.js";
import type { ParsedStylesheet, StyleDeclaration, StyleRule } from "./types.js";

/** One open block while the stylesheet is walked. */
type OpenBlock =
  | { readonly kind: "at-rule"; readonly prelude: string }
  | {
      readonly kind: "rule";
      readonly selectors: readonly string[];
      readonly declarations: StyleDeclaration[];
      readonly conditions: readonly string[];
    };

/**
 * Read one declaration, `property: value`, with the value's whitespace
 * collapsed.
 *
 * @throws When the text holds no colon.
 */
function readDeclaration(text: string): StyleDeclaration {
  const colon = text.indexOf(":");
  if (colon === -1) {
    throw new Error(`"${text}" is not a declaration`);
  }
  return {
    property: text.slice(0, colon).trim(),
    value: text
      .slice(colon + 1)
      .replaceAll(/\s+/g, " ")
      .trim(),
  };
}

/**
 * Read a stylesheet into its top-level layer wrappers and its rules, each
 * rule with its selectors, its declarations and the conditional at-rules
 * around it. The `@layer` wrapper is a wrapper, not a condition, so it is
 * left out of a rule's conditions. Nested style rules are refused: the
 * checks read a component's stylesheet as flat rules under at-rules.
 *
 * @param css - The stylesheet's text, comments and all.
 * @returns The parsed stylesheet.
 * @throws When a brace is unbalanced or a style rule nests another.
 */
export default function parseStylesheet(css: string): ParsedStylesheet {
  const text = stripComments(css);
  const stack: OpenBlock[] = [];
  const rules: StyleRule[] = [];
  const layers: string[] = [];
  let statementCount = 0;
  let buffer = "";

  for (const character of text) {
    if (character === "{") {
      const prelude = buffer.replaceAll(/\s+/g, " ").trim();
      buffer = "";
      const parent = stack.at(-1);
      if (parent?.kind === "rule") {
        throw new Error(`a style rule nests "${prelude}"`);
      }
      if (stack.length === 0) {
        statementCount += 1;
        const layer = /^@layer (\S+)$/.exec(prelude)?.at(1);
        if (layer !== undefined) layers.push(layer);
      }
      if (prelude.startsWith("@")) {
        stack.push({ kind: "at-rule", prelude });
      } else {
        stack.push({
          kind: "rule",
          selectors: splitTopLevel(prelude, ","),
          declarations: [],
          conditions: stack
            .flatMap((block) => (block.kind === "at-rule" ? [block] : []))
            .map((block) => block.prelude)
            .filter((condition) => !condition.startsWith("@layer")),
        });
      }
    } else if (character === "}") {
      const block = stack.pop();
      if (block === undefined) {
        throw new Error("the stylesheet closes a block it never opened");
      }
      if (block.kind === "rule") {
        if (buffer.trim() !== "") {
          block.declarations.push(readDeclaration(buffer));
        }
        rules.push({
          selectors: block.selectors,
          declarations: block.declarations,
          conditions: block.conditions,
        });
      }
      buffer = "";
    } else if (character === ";") {
      const block = stack.at(-1);
      if (block?.kind === "rule") {
        block.declarations.push(readDeclaration(buffer));
      } else if (stack.length === 0 && buffer.trim() !== "") {
        statementCount += 1;
      }
      buffer = "";
    } else {
      buffer += character;
    }
  }

  if (stack.length > 0) {
    throw new Error("the stylesheet leaves a block open");
  }
  return { layers, statementCount, rules };
}
