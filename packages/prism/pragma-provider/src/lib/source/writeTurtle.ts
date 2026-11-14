import type { Quad, Term } from "@canonical/ke";
import {
  PN_LOCAL,
  RDF_LANG_STRING,
  RDF_TYPE,
  STRING_ESCAPES,
  XSD_STRING,
} from "./constants.js";

/** Compare two texts in code-point order. */
const compareText = (left: string, right: string): number =>
  left < right ? -1 : Number(left > right);

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

/** The key a term is told apart by: its kind, value, language and datatype. */
const readTermKey = (term: Term): string =>
  JSON.stringify(
    term.termType === "Literal"
      ? [term.termType, term.value, term.language, term.datatype]
      : [term.termType, term.value],
  );

/** One subject's statements: the subject, and its objects by predicate. */
interface Description {
  readonly subject: Term;
  readonly objects: Map<string, Term[]>;
}

/**
 * Group statements by subject, each predicate written once (`a` for the
 * type), and count how many statements name each blank node as object. A
 * statement given twice counts once.
 */
const describeSubjects = (
  quads: readonly Quad[],
  prefixes: ReadonlyMap<string, string>,
  used: Set<string>,
): {
  readonly descriptions: ReadonlyMap<string, Description>;
  readonly references: ReadonlyMap<string, number>;
} => {
  const descriptions = new Map<string, Description>();
  const references = new Map<string, number>();
  const seen = new Set<string>();
  for (const { subject, predicate, object } of quads) {
    const key = readTermKey(subject);
    const statementKey = `${key} ${predicate.value} ${readTermKey(object)}`;
    if (seen.has(statementKey)) continue;
    seen.add(statementKey);
    const description = descriptions.get(key) ?? {
      subject,
      objects: new Map<string, Term[]>(),
    };
    const predicateText =
      predicate.value === RDF_TYPE ? "a" : writeTerm(predicate, prefixes, used);
    description.objects.set(predicateText, [
      ...(description.objects.get(predicateText) ?? []),
      object,
    ]);
    descriptions.set(key, description);
    if (object.termType === "BlankNode") {
      const objectKey = readTermKey(object);
      references.set(objectKey, (references.get(objectKey) ?? 0) + 1);
    }
  }
  return { descriptions, references };
};

/**
 * Write statements as Turtle with the given prefixes: an `@prefix` line for
 * each prefix the statements use, in code-point order, then each subject
 * once, in code-point order, with its type first as `a` and its other
 * predicates in code-point order, separated by `;`, the objects of one
 * predicate in code-point order of their written form, separated by `,`.
 * A blank node that is the object of exactly one statement is written in
 * place, as `[ … ]` with its own statements nested the same way; any other
 * blank node keeps a label and its own block, so a cycle still closes. An
 * IRI is shortened only when a prefix's namespace starts it and the rest is
 * a valid local name; literals keep their language or datatype. The same
 * statements always read the same.
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
  const { descriptions, references } = describeSubjects(quads, prefixes, used);
  const isNested = (term: Term): boolean =>
    term.termType === "BlankNode" && references.get(readTermKey(term)) === 1;

  /** One subject's predicate lines, each indented `depth` steps. */
  const writeLines = (
    objects: ReadonlyMap<string, readonly Term[]>,
    depth: number,
  ): string =>
    [...objects]
      .sort(([left], [right]) =>
        compareText(readPredicateKey(left), readPredicateKey(right)),
      )
      .map(
        ([predicate, terms]) =>
          `${"  ".repeat(depth)}${predicate} ${terms
            .map((term) => writeObject(term, depth))
            .sort(compareText)
            .join(", ")}`,
      )
      .join(" ;\n");

  /** An object: a nested blank node in place, any other term as itself. */
  const writeObject = (term: Term, depth: number): string => {
    if (!isNested(term)) return writeTerm(term, prefixes, used);
    const objects = descriptions.get(readTermKey(term))?.objects;
    if (objects === undefined) return "[]";
    return `[\n${writeLines(objects, depth + 1)}\n${"  ".repeat(depth)}]`;
  };

  const statements = [...descriptions.values()]
    .filter(({ subject }) => !isNested(subject))
    .map(({ subject, objects }) => ({
      subject: writeTerm(subject, prefixes, used),
      lines: writeLines(objects, 1),
    }))
    .sort((left, right) => compareText(left.subject, right.subject))
    .map(({ subject, lines }) => `${subject}\n${lines} .\n`);
  const header = [...used]
    .sort(compareText)
    .map((prefix) => `@prefix ${prefix}: <${prefixes.get(prefix)}> .\n`)
    .join("");
  return [header, ...statements].filter((part) => part !== "").join("\n");
};
