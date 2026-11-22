import { describe, expect, it } from "vitest";
import { METRO_NAMESPACE as METRO, RDF_TYPE_URI } from "./constants.js";
import { exampleDataset } from "./dataset.js";
import listRecordStatements from "./listRecordStatements.js";
import type { RecordStatement } from "./types.js";

/** The record of `uri`, an entity or a class of the dataset. */
const recordOf = (uri: string) => {
  const record = [...exampleDataset.entities, ...exampleDataset.classes].find(
    (candidate) => candidate.uri === uri,
  );
  if (record === undefined) throw new Error(`no record ${uri}`);
  return record;
};

/** The objects of one predicate, by its local name. */
const objectsOf = (statements: readonly RecordStatement[], name: string) =>
  statements
    .filter(({ predicate }) => predicate.endsWith(`#${name}`))
    .map(({ object }) => object);

/** The nested statements of a term, which must be nested. */
const expand = (term: RecordStatement["object"] | undefined) => {
  if (term?.kind !== "nested") throw new Error("not a nested value");
  return term.statements();
};

describe("listRecordStatements", () => {
  it("states an entity's type first", () => {
    const statements = listRecordStatements(
      recordOf(`${METRO}central-exchange`),
      exampleDataset,
    );
    expect(statements.at(0)).toEqual({
      predicate: RDF_TYPE_URI,
      object: { kind: "node", uri: `${METRO}Interchange` },
    });
  });

  it("tags a label in another language and leaves the default untagged", () => {
    const labels = objectsOf(
      listRecordStatements(recordOf(`${METRO}circle-line`), exampleDataset),
      "label",
    );
    expect(labels).toContainEqual({
      kind: "literal",
      lexical: "Ligne Circulaire",
      datatype: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
      lang: "fr",
    });
    expect(labels).toContainEqual({
      kind: "literal",
      lexical: "Circle Line",
      datatype: "http://www.w3.org/2001/XMLSchema#string",
      lang: null,
    });
  });

  it("nests a diagram position and states its coordinates", () => {
    const [position] = objectsOf(
      listRecordStatements(
        recordOf(`${METRO}central-exchange`),
        exampleDataset,
      ),
      "diagramPosition",
    );
    expect(expand(position).map(({ object }) => object)).toEqual([
      {
        kind: "literal",
        lexical: "0",
        datatype: "http://www.w3.org/2001/XMLSchema#integer",
        lang: null,
      },
      {
        kind: "literal",
        lexical: "9",
        datatype: "http://www.w3.org/2001/XMLSchema#integer",
        lang: null,
      },
    ]);
  });

  it("keys a line's routes and nests each route's reverse", () => {
    const routes = objectsOf(
      listRecordStatements(recordOf(`${METRO}north-line`), exampleDataset),
      "routes",
    );
    expect(routes.map((route) => route.kind === "nested" && route.key)).toEqual(
      ["southbound", "northbound"],
    );
    expect(
      routes.map((route) => route.kind === "nested" && route.type),
    ).toEqual([`${METRO}Route`, `${METRO}Route`]);
    const [reverse] = objectsOf(expand(routes.at(0)), "reverse");
    expect(reverse?.kind === "nested" && reverse.key).toBe("northbound");
    expect(reverse?.kind === "nested" && reverse.type).toBe(`${METRO}Route`);
    expect(objectsOf(expand(reverse), "isLoop")).toEqual([
      {
        kind: "literal",
        lexical: "false",
        datatype: "http://www.w3.org/2001/XMLSchema#boolean",
        lang: null,
      },
    ]);
  });

  it("states no reverse for a loop route that has none", () => {
    const [route] = objectsOf(
      listRecordStatements(
        recordOf(`${METRO}ringway-clockwise`),
        exampleDataset,
      ),
      "routes",
    );
    const statements = expand(route);
    expect(objectsOf(statements, "reverse")).toEqual([]);
    expect(objectsOf(statements, "calls").length).toBeGreaterThan(0);
  });

  it("indexes a unit's cars and states their position, type and reversal", () => {
    const cars = objectsOf(
      listRecordStatements(recordOf(`${METRO}unit-70`), exampleDataset),
      "cars",
    );
    expect(cars.at(0)?.kind === "nested" && cars.at(0)).toMatchObject({
      key: "0",
    });
    const statements = expand(cars.at(0));
    expect(objectsOf(statements, "position")).toEqual([
      {
        kind: "literal",
        lexical: "1",
        datatype: "http://www.w3.org/2001/XMLSchema#integer",
        lang: null,
      },
    ]);
    expect(objectsOf(statements, "carType").at(0)?.kind).toBe("node");
    expect(objectsOf(statements, "reversed").at(0)?.kind).toBe("literal");
  });

  it("states a class as an owl:Class", () => {
    const statements = listRecordStatements(
      recordOf(`${METRO}Line`),
      exampleDataset,
    );
    expect(statements.at(0)?.object).toEqual({
      kind: "node",
      uri: "http://www.w3.org/2002/07/owl#Class",
    });
  });
});
