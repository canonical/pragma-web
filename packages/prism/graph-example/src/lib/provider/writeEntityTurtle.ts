import {
  GEO_NAMESPACE,
  GEO_POINT_CLASS_URI,
  RDFS_NAMESPACE,
  TURTLE_RECORD_KEYS,
  TURTLE_STANDARD_PREFIXES,
} from "./constants.js";
import type {
  ExampleClass,
  ExampleDataset,
  ExampleEntity,
  ExampleRoute,
  LangMap,
} from "./types.js";

/** A local name a prefixed name may end in. */
const PN_LOCAL = /^[A-Za-z0-9_](?:[A-Za-z0-9_.-]*[A-Za-z0-9_-])?$/;

/** The characters a Turtle string escapes, and how. */
const STRING_ESCAPES: ReadonlyMap<string, string> = new Map([
  ["\\", "\\\\"],
  ['"', '\\"'],
  ["\n", "\\n"],
  ["\r", "\\r"],
  ["\t", "\\t"],
]);

/** Writes the terms of one document, recording the prefixes it uses. */
interface TermWriter {
  /** An IRI, shortened when a prefix fits it. */
  readonly iri: (value: string) => string;
  /** The prefixes the document has used so far. */
  readonly used: ReadonlySet<string>;
}

/**
 * A term writer over `prefixes`.
 *
 * @note Impure: the writer records each prefix it uses.
 */
const createTermWriter = (
  prefixes: ReadonlyMap<string, string>,
): TermWriter => {
  const used = new Set<string>();
  const iri = (value: string): string => {
    const match = [...prefixes].find(
      ([, namespace]) =>
        value.startsWith(namespace) &&
        PN_LOCAL.test(value.slice(namespace.length)),
    );
    if (match === undefined) return `<${value}>`;
    used.add(match[0]);
    return `${match[0]}:${value.slice(match[1].length)}`;
  };
  return { iri, used };
};

/** A string as a Turtle string, its quotes and control characters escaped. */
const writeString = (value: string): string =>
  `"${[...value].map((character) => STRING_ESCAPES.get(character) ?? character).join("")}"`;

/** A language map's texts as literals, the default language untagged. */
const writeLangMap = (map: LangMap | undefined): string[] =>
  Object.entries(map ?? {}).map(([lang, text]) =>
    lang === "" ? writeString(text) : `${writeString(text)}@${lang}`,
  );

/** A number as a literal: an integer bare, any other as a double. */
const writeNumber = (value: number, writer: TermWriter): string =>
  Number.isInteger(value)
    ? String(value)
    : `${writeString(String(value))}^^${writer.iri("http://www.w3.org/2001/XMLSchema#double")}`;

/**
 * The property IRI a record key is written with, by its local name.
 *
 * @throws When the dataset declares no property of that name: every value
 *   a record holds is stated through a declared property.
 */
const findPropertyIri = (key: string, dataset: ExampleDataset): string => {
  const property = dataset.properties.find(({ uri }) =>
    uri.endsWith(`#${key}`),
  );
  if (property === undefined) {
    throw new Error(`the dataset declares no property named ${key}`);
  }
  return property.uri;
};

/** One predicate and its objects, written. */
type PredicateLine = readonly [predicate: string, objects: readonly string[]];

/** Join predicate lines as a predicate-object list. */
const joinLines = (lines: readonly PredicateLine[], indent: string): string =>
  lines
    .filter(([, objects]) => objects.length > 0)
    .map(
      ([predicate, objects]) => `${indent}${predicate} ${objects.join(", ")}`,
    )
    .join(" ;\n");

/** A blank node written inline from its predicate lines. */
const writeBlankNode = (lines: readonly PredicateLine[]): string =>
  `[\n${joinLines(lines, "    ")}\n  ]`;

/** The label a route's blank node is written with in one document. */
const labelRoute = (route: ExampleRoute): string =>
  `_:route-${route.key.replaceAll(/[^A-Za-z0-9_-]/g, "_")}`;

/**
 * The objects one record key is written with: its value as literals,
 * IRIs, inline blank nodes or labelled route nodes.
 */
const writeValue = (
  key: string,
  value: unknown,
  dataset: ExampleDataset,
  writer: TermWriter,
): string[] => {
  const predicate = (name: string): string =>
    writer.iri(findPropertyIri(name, dataset));
  if (key === "location") {
    const point = value as { latitude: number; longitude: number };
    return [
      writeBlankNode([
        ["a", [writer.iri(GEO_POINT_CLASS_URI)]],
        [
          writer.iri(`${GEO_NAMESPACE}latitude`),
          [writeNumber(point.latitude, writer)],
        ],
        [
          writer.iri(`${GEO_NAMESPACE}longitude`),
          [writeNumber(point.longitude, writer)],
        ],
      ]),
    ];
  }
  if (key === "diagramPosition") {
    const point = value as { x: number; y: number };
    return [
      writeBlankNode([
        [predicate("x"), [writeNumber(point.x, writer)]],
        [predicate("y"), [writeNumber(point.y, writer)]],
      ]),
    ];
  }
  if (key === "routes") {
    return (value as readonly ExampleRoute[]).map(labelRoute);
  }
  if (key === "units" || key === "cars") {
    const target = key === "units" ? "unit" : "carType";
    return (value as readonly Readonly<Record<string, unknown>>[]).map(
      (placement, index) =>
        writeBlankNode([
          [predicate("position"), [String(index + 1)]],
          [predicate(target), [writer.iri(String(placement[target]))]],
          [predicate("reversed"), [String(placement.reversed)]],
        ]),
    );
  }
  const values = Array.isArray(value) ? value : [value];
  return values.map((item) => {
    if (typeof item === "number") return writeNumber(item, writer);
    if (typeof item === "boolean") return String(item);
    const text = String(item);
    const isReference = dataset.properties.some(
      ({ uri, kind }) => uri.endsWith(`#${key}`) && kind === "OBJECT",
    );
    return isReference ? writer.iri(text) : writeString(text);
  });
};

/** The statements of a route's labelled node. */
const writeRoute = (
  route: ExampleRoute,
  routes: readonly ExampleRoute[],
  dataset: ExampleDataset,
  writer: TermWriter,
): string => {
  const reverse = routes.find(({ key }) => key === route.reverse);
  const predicate = (name: string): string =>
    writer.iri(findPropertyIri(name, dataset));
  return `${labelRoute(route)}\n${joinLines(
    [
      [writer.iri(`${RDFS_NAMESPACE}label`), writeLangMap(route.labels)],
      [predicate("isLoop"), [String(route.isLoop)]],
      [predicate("calls"), [`( ${route.calls.map(writer.iri).join(" ")} )`]],
      [
        predicate("reverse"),
        reverse === undefined ? [] : [labelRoute(reverse)],
      ],
    ],
    "  ",
  )} .\n`;
};

/**
 * Write one record of the dataset as Turtle: its type first as `a`, its
 * labels, comments and definitions per language, then each of its values
 * through the ontology's property of the same local name. Scalars are
 * typed literals, references IRIs, a location and a diagram position
 * blank nodes, a formation's units and a unit's cars blank nodes with
 * their positions counted from 1, and a line's routes labelled nodes whose
 * calls are an RDF collection in order. The prefixes are the dataset's
 * ontologies' and the standard vocabularies' the document uses, in
 * code-point order. Pure.
 *
 * @param record - An entity of the dataset, or one of its classes.
 * @param dataset - The dataset, whose ontologies and properties name the
 *   statements.
 * @returns The record as a Turtle document.
 */
export default function writeEntityTurtle(
  record: ExampleEntity | ExampleClass,
  dataset: ExampleDataset,
): string {
  const prefixes = new Map([
    ...TURTLE_STANDARD_PREFIXES,
    ...dataset.ontologies.map(
      ({ prefix, namespace }) => [prefix, namespace] as const,
    ),
  ]);
  const writer = createTermWriter(prefixes);
  const isClass = !("type" in record);
  const fields = record as unknown as Readonly<Record<string, unknown>>;
  const lines: PredicateLine[] = [
    [
      "a",
      [
        writer.iri(
          isClass ? "http://www.w3.org/2002/07/owl#Class" : String(fields.type),
        ),
      ],
    ],
    [
      writer.iri("http://www.w3.org/2000/01/rdf-schema#subClassOf"),
      isClass && record.superclass !== undefined
        ? [writer.iri(record.superclass)]
        : [],
    ],
    [writer.iri(`${RDFS_NAMESPACE}label`), writeLangMap(record.labels)],
    [writer.iri(`${RDFS_NAMESPACE}comment`), writeLangMap(record.comments)],
    [
      writer.iri("http://www.w3.org/2004/02/skos/core#definition"),
      writeLangMap(record.definitions),
    ],
    ...TURTLE_RECORD_KEYS.filter((key) => fields[key] !== undefined).map(
      (key): PredicateLine => [
        writer.iri(findPropertyIri(key, dataset)),
        writeValue(key, fields[key], dataset, writer),
      ],
    ),
  ];
  const routes = (fields.routes ?? []) as readonly ExampleRoute[];
  const body = [
    `${writer.iri(record.uri)}\n${joinLines(lines, "  ")} .\n`,
    ...routes.map((route) => writeRoute(route, routes, dataset, writer)),
  ];
  const header = [...writer.used]
    .sort()
    .map((prefix) => `@prefix ${prefix}: <${prefixes.get(prefix)}> .\n`)
    .join("");
  return [header, ...body].join("\n");
}
