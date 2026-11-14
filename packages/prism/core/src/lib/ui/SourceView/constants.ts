import type { TurtleTokenRole } from "./types.js";

/**
 * The lexical rules the Turtle tokenizer tries at each position, in order,
 * each a sticky pattern and the role its match takes. A string's language
 * tag or datatype belongs to the literal; a prefixed name ends before a
 * statement's closing dot. Whatever no rule matches is one character of
 * text: punctuation, `a`, brackets, blank-node labels and whitespace.
 */
export const TURTLE_RULES: readonly {
  readonly pattern: RegExp;
  readonly role: TurtleTokenRole;
}[] = [
  { pattern: /#[^\n\r]*/y, role: "comment" },
  { pattern: /@(?:prefix|base)\b|(?:PREFIX|BASE)\b/iy, role: "directive" },
  { pattern: /<[^<>"{}|^`\\\s]*>/y, role: "iri" },
  {
    pattern:
      /(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n\r]|\\.)*"|'(?:[^'\\\n\r]|\\.)*')(?:@[A-Za-z]+(?:-[A-Za-z0-9]+)*|\^\^(?:<[^<>"{}|^`\\\s]*>|[A-Za-z][\w-]*(?:\.[\w-]+)*:[\w-]*(?:\.[\w-]+)*))?/y,
    role: "literal",
  },
  {
    pattern:
      /[+-]?(?:\d+\.\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?|\d+(?:[eE][+-]?\d+)?)(?![\w:])/y,
    role: "literal",
  },
  { pattern: /(?:true|false)(?![\w:-])/y, role: "literal" },
  { pattern: /_:[\w-]+(?:\.[\w-]+)*/y, role: "text" },
  {
    pattern: /(?:[A-Za-z][\w-]*(?:\.[\w-]+)*)?:(?:[\w%-]+(?:[.:][\w%-]+)*)?/y,
    role: "iri",
  },
];
