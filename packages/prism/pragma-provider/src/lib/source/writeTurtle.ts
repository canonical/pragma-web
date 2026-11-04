import type { Quad, Term } from "@canonical/ke";
import {
  PN_LOCAL,
  RDF_LANG_STRING,
  RDF_TYPE,
  STRING_ESCAPES,
  XSD_STRING,
} from "./constants.js";

/**
 * Compare two distinct texts in code-point order; every list sorted here
 * holds each text once.
 */
const compareText = (left: string, right: string): number =>
  left < right ? -1 : 1;

/** The key a predicate sorts by: `a` before every other. */
const readPredicateKey = (predicate: string): string =>
  predicate === "a" ? "" : predicate;

/**
 * The prefix and local name `iri` is written with, or `undefined` when no
 * prefix's namespace starts it with a local name a prefixed name can end
 * in. The longest namespace wins.
 */
const findPrefixedName = (
  iri: string,
  prefixes: ReadonlyMap<string, string>,
): { readonly prefix: string; readonly local: string } | undefined =>
  [...prefixes]
    .filter(([, namespace]) => iri.startsWith(namespace))
    .map(([prefix, namespace]) => ({
      prefix,
      local: iri.slice(namespace.length),
      length: namespace.length,
    }))
    .filter(({ local }) => PN_LOCAL.test(local))
    .sort((left, right) => right.length - left.length)
    .at(0);

/** A string as a Turtle string, its quotes and control characters escaped. */
const writeString = (value: string): string =>
  `"${[...value].map((character) => STRING_ESCAPES.get(character) ?? character).join("")}"`;

/**
 * Write one term, recording the prefix it uses.
 *
 * @note Impure: adds to `used`.
 */
const writeTerm = (
  term: Term,
  prefixes: ReadonlyMap<string, string>,
  used: Set<string>,
): string => {
  if (term.termType === "BlankNode") {
    return `_:${term.value.replaceAll(/[^A-Za-z0-9_-]/g, "_")}`;
  }
  if (term.termType === "NamedNode") {
    const name = findPrefixedName(term.value, prefixes);
    if (name === undefined) return `<${term.value}>`;
    used.add(name.prefix);
    return `${name.prefix}:${name.local}`;
  }
  const text = writeString(term.value);
  if (term.language !== undefined && term.language !== "") {
    return `${text}@${term.language}`;
  }
  if (
    term.datatype === undefined ||
    term.datatype === XSD_STRING ||
    term.datatype === RDF_LANG_STRING
  ) {
    return text;
  }
  return `${text}^^${writeTerm({ termType: "NamedNode", value: term.datatype }, prefixes, used)}`;
};

/**
 * Write statements as Turtle with the given prefixes: an `@prefix` line for
 * each prefix the statements use, in code-point order, then each subject
 * once, in code-point order, with its type first as `a` and its other
 * predicates in code-point order, separated by `;`, the objects of one
 * predicate in code-point order of their written form, separated by `,`.
 * An IRI is shortened only when a prefix's namespace starts it and the rest
 * is a valid local name; literals keep their language or datatype. The
 * same statements always read the same.
 *
 * @param quads - The statements.
 * @param prefixes - The prefixes the document may use, by name.
 * @returns The Turtle document, or `""` for no statements.
 */
export const writeTurtle = (
  quads: readonly Quad[],
  prefixes: ReadonlyMap<string, string>,
): string => {
  const used = new Set<string>();
  const subjects = new Map<string, Map<string, Set<string>>>();
  for (const { subject, predicate, object } of quads) {
    const subjectText = writeTerm(subject, prefixes, used);
    const predicateText =
      predicate.value === RDF_TYPE ? "a" : writeTerm(predicate, prefixes, used);
    const predicates = subjects.get(subjectText) ?? new Map();
    const objects: Set<string> = predicates.get(predicateText) ?? new Set();
    objects.add(writeTerm(object, prefixes, used));
    predicates.set(predicateText, objects);
    subjects.set(subjectText, predicates);
  }
  const statements = [...subjects]
    .sort(([left], [right]) => compareText(left, right))
    .map(([subject, predicates]) => {
      const lines = [...predicates]
        .sort(([left], [right]) =>
          compareText(readPredicateKey(left), readPredicateKey(right)),
        )
        .map(
          ([predicate, objects]) =>
            `  ${predicate} ${[...objects].sort(compareText).join(", ")}`,
        );
      return `${subject}\n${lines.join(" ;\n")} .\n`;
    });
  const header = [...used]
    .sort(compareText)
    .map((prefix) => `@prefix ${prefix}: <${prefixes.get(prefix)}> .\n`)
    .join("");
  return [header, ...statements].filter((part) => part !== "").join("\n");
};
