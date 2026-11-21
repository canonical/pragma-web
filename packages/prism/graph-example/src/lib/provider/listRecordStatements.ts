import {
  GEO_NAMESPACE,
  GEO_POINT_CLASS_URI,
  OWL_CLASS_URI,
  RDF_LANG_STRING_URI,
  RDF_TYPE_URI,
  RDFS_NAMESPACE,
  SKOS_DEFINITION_URI,
  SUBCLASS_OF_URI,
  TURTLE_RECORD_KEYS,
  XSD_NAMESPACE,
} from "./constants.js";
import findPropertyIri from "./findPropertyIri.js";
import type {
  ExampleClass,
  ExampleDataset,
  ExampleEntity,
  ExampleRoute,
  LangMap,
  RecordStatement,
  RecordTerm,
} from "./types.js";

/** A node term. */
const toNode = (uri: string): RecordTerm => ({ kind: "node", uri });

/** A literal term of an XML Schema datatype, untagged. */
const toTyped = (lexical: string, datatype: string): RecordTerm => ({
  kind: "literal",
  lexical,
  datatype: `${XSD_NAMESPACE}${datatype}`,
  lang: null,
});

/** A number as a literal: an integer as `xsd:integer`, any other a double. */
const toNumber = (value: number): RecordTerm =>
  toTyped(String(value), Number.isInteger(value) ? "integer" : "double");

/** A language map's texts as literals, the default language untagged. */
const toLangStatements = (
  predicate: string,
  map: LangMap | undefined,
): RecordStatement[] =>
  Object.entries(map ?? {}).map(([lang, text]) => ({
    predicate,
    object:
      lang === ""
        ? toTyped(text, "string")
        : {
            kind: "literal",
            lexical: text,
            datatype: RDF_LANG_STRING_URI,
            lang,
          },
  }));

/** A value with no IRI, its statements read on demand. */
const toNested = (
  type: string | null,
  key: string,
  statements: () => readonly RecordStatement[],
): RecordTerm => ({ kind: "nested", type, key, statements });

/** The statements one route makes, its reverse a route of the same line. */
const listRouteStatements = (
  route: ExampleRoute,
  routes: readonly ExampleRoute[],
  dataset: ExampleDataset,
): readonly RecordStatement[] => {
  const property = (name: string): string => findPropertyIri(name, dataset);
  const reverse = routes.find(({ key }) => key === route.reverse);
  return [
    ...toLangStatements(`${RDFS_NAMESPACE}label`, route.labels),
    {
      predicate: property("isLoop"),
      object: toTyped(String(route.isLoop), "boolean"),
    },
    ...route.calls.map((call) => ({
      predicate: property("calls"),
      object: toNode(call),
    })),
    ...(reverse === undefined
      ? []
      : [
          {
            predicate: property("reverse"),
            object: toNested(null, reverse.key, () =>
              listRouteStatements(reverse, routes, dataset),
            ),
          },
        ]),
  ];
};

/** The objects one record key states, as `writeEntityTurtle` writes them. */
const listValueTerms = (
  key: string,
  value: unknown,
  dataset: ExampleDataset,
): RecordTerm[] => {
  const property = (name: string): string => findPropertyIri(name, dataset);
  if (key === "location") {
    const point = value as { latitude: number; longitude: number };
    return [
      toNested(GEO_POINT_CLASS_URI, "0", () => [
        {
          predicate: `${GEO_NAMESPACE}latitude`,
          object: toNumber(point.latitude),
        },
        {
          predicate: `${GEO_NAMESPACE}longitude`,
          object: toNumber(point.longitude),
        },
      ]),
    ];
  }
  if (key === "diagramPosition") {
    const point = value as { x: number; y: number };
    return [
      toNested(null, "0", () => [
        { predicate: property("x"), object: toNumber(point.x) },
        { predicate: property("y"), object: toNumber(point.y) },
      ]),
    ];
  }
  if (key === "routes") {
    const routes = value as readonly ExampleRoute[];
    return routes.map((route) =>
      toNested(null, route.key, () =>
        listRouteStatements(route, routes, dataset),
      ),
    );
  }
  if (key === "units" || key === "cars") {
    const target = key === "units" ? "unit" : "carType";
    return (value as readonly Readonly<Record<string, unknown>>[]).map(
      (placement, index) =>
        toNested(null, String(index), () => [
          { predicate: property("position"), object: toNumber(index + 1) },
          {
            predicate: property(target),
            object: toNode(String(placement[target])),
          },
          {
            predicate: property("reversed"),
            object: toTyped(String(placement.reversed), "boolean"),
          },
        ]),
    );
  }
  const isReference = dataset.properties.some(
    ({ uri, kind }) => uri.endsWith(`#${key}`) && kind === "OBJECT",
  );
  return (Array.isArray(value) ? value : [value]).map((item) => {
    if (typeof item === "number") return toNumber(item);
    if (typeof item === "boolean") return toTyped(String(item), "boolean");
    return isReference ? toNode(String(item)) : toTyped(String(item), "string");
  });
};

/**
 * List the statements one record of the dataset makes, the same ones
 * `writeEntityTurtle` writes: its type, a class's superclass, its labels,
 * comments and definitions per language, then each value through the
 * ontology's property of the same local name. A location, a diagram
 * position, a route and a unit's or car's placement are nested values
 * selected by their key (a route's) or index, their statements read on
 * demand. Pure.
 *
 * @param record - An entity of the dataset, or one of its classes.
 * @param dataset - The dataset whose properties name the statements.
 * @returns The record's statements, in the record's own order.
 */
export default function listRecordStatements(
  record: ExampleEntity | ExampleClass,
  dataset: ExampleDataset,
): readonly RecordStatement[] {
  const isClass = !("type" in record);
  const fields = record as unknown as Readonly<Record<string, unknown>>;
  return [
    {
      predicate: RDF_TYPE_URI,
      object: toNode(isClass ? OWL_CLASS_URI : String(fields.type)),
    },
    ...(isClass && record.superclass !== undefined
      ? [{ predicate: SUBCLASS_OF_URI, object: toNode(record.superclass) }]
      : []),
    ...toLangStatements(`${RDFS_NAMESPACE}label`, record.labels),
    ...toLangStatements(`${RDFS_NAMESPACE}comment`, record.comments),
    ...toLangStatements(SKOS_DEFINITION_URI, record.definitions),
    ...TURTLE_RECORD_KEYS.filter((key) => fields[key] !== undefined).flatMap(
      (key) =>
        listValueTerms(key, fields[key], dataset).map((object) => ({
          predicate: findPropertyIri(key, dataset),
          object,
        })),
    ),
  ];
}
