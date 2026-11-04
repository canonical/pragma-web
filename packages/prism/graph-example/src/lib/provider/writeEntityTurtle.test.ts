import oxigraph from "oxigraph";
import { describe, expect, it } from "vitest";
import { GEO_NAMESPACE, METRO_NAMESPACE } from "./constants.js";
import { exampleDataset } from "./dataset.js";
import type { ExampleClass, ExampleEntity } from "./types.js";
import writeEntityTurtle from "./writeEntityTurtle.js";

/** The dataset's record at `uri`. */
const findRecord = (uri: string): ExampleEntity | ExampleClass => {
  const record =
    exampleDataset.entities.find((entity) => entity.uri === uri) ??
    exampleDataset.classes.find((cls) => cls.uri === uri);
  if (record === undefined) throw new Error(`no record ${uri}`);
  return record;
};

/** Parse `text` and answer `select` over it, each row's terms as text. */
const ask = (text: string, select: string): string[][] => {
  const store = new oxigraph.Store();
  store.load(text, { format: "text/turtle" });
  const rows = store.query(
    `PREFIX metro: <${METRO_NAMESPACE}>
     PREFIX geo: <${GEO_NAMESPACE}>
     PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
     PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
     PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
     PREFIX owl: <http://www.w3.org/2002/07/owl#>
     ${select}`,
  ) as Map<string, { value: string }>[];
  return rows.map((row) => [...row.values()].map((term) => term.value));
};

const CENTRAL = `${METRO_NAMESPACE}central-exchange`;
const CIRCLE = `${METRO_NAMESPACE}circle-line`;

describe("writeEntityTurtle", () => {
  it("writes a station's statements, which parse back to the record", () => {
    const text = writeEntityTurtle(findRecord(CENTRAL), exampleDataset);
    expect(text.startsWith("@prefix ")).toBe(true);
    const at = (property: string): string[] =>
      ask(text, `SELECT ?o WHERE { <${CENTRAL}> ${property} ?o }`)
        .map(([value]) => value ?? "")
        .sort();
    expect(at("rdf:type")).toEqual([`${METRO_NAMESPACE}Interchange`]);
    expect(at("rdfs:label")).toEqual(["Central Exchange"]);
    expect(at("skos:definition")).toEqual([
      "The busiest transfer point on the network.",
    ]);
    expect(at("metro:platformCount")).toEqual(["8"]);
    expect(at("metro:transferMinutes")).toEqual(["4"]);
    expect(at("geo:inZone")).toEqual([`${GEO_NAMESPACE}central-zone`]);
    expect(at("metro:servesLine")).toEqual(
      ["north-line", "circle-line", "coastal-line"]
        .map((name) => `${METRO_NAMESPACE}${name}`)
        .sort(),
    );
    expect(
      ask(
        text,
        `SELECT ?lat ?long WHERE { <${CENTRAL}> geo:location [ a geo:GeoPoint ; geo:latitude ?lat ; geo:longitude ?long ] }`,
      ),
    ).toEqual([["51.5074", "-0.1278"]]);
    expect(
      ask(
        text,
        `SELECT ?x ?y WHERE { <${CENTRAL}> metro:diagramPosition [ metro:x ?x ; metro:y ?y ] }`,
      ),
    ).toEqual([["0", "9"]]);
  });

  it("writes a line's routes with their calls as ordered collections", () => {
    const text = writeEntityTurtle(findRecord(CIRCLE), exampleDataset);
    expect(
      ask(
        text,
        `SELECT ?label ?loop WHERE { <${CIRCLE}> metro:routes ?route . ?route rdfs:label ?label ; metro:isLoop ?loop }`,
      ).sort(),
    ).toEqual([
      ["Anticlockwise", "true"],
      ["Clockwise", "true"],
    ]);
    const first = ask(
      text,
      `SELECT ?stop WHERE { <${CIRCLE}> metro:routes ?route . ?route rdfs:label "Clockwise" ; metro:calls ?list . ?list rdf:first ?stop }`,
    );
    expect(first).toEqual([[CENTRAL]]);
    expect(
      ask(
        text,
        `SELECT ?back WHERE { ?route rdfs:label "Clockwise" ; metro:reverse ?other . ?other rdfs:label ?back }`,
      ),
    ).toEqual([["Anticlockwise"]]);
    expect(
      ask(text, `SELECT ?label WHERE { <${CIRCLE}> rdfs:label ?label }`)
        .map(([label]) => label)
        .sort(),
    ).toEqual(["Circle Line", "Ligne Circulaire"]);
  });

  it("writes a route that runs one way without a reverse", () => {
    const ringway = exampleDataset.entities.find(
      (entity) =>
        "routes" in entity &&
        entity.routes?.length === 1 &&
        entity.routes.at(0)?.reverse === undefined,
    );
    if (ringway === undefined) throw new Error("no one-way line");
    const text = writeEntityTurtle(ringway, exampleDataset);
    expect(
      ask(text, "SELECT ?route WHERE { ?route metro:isLoop ?loop }"),
    ).toHaveLength(1);
    expect(
      ask(text, "SELECT ?other WHERE { ?route metro:reverse ?other }"),
    ).toEqual([]);
  });

  it("writes a unit's cars with their positions counted from 1", () => {
    const unit = `${METRO_NAMESPACE}unit-70`;
    const text = writeEntityTurtle(findRecord(unit), exampleDataset);
    const cars = ask(
      text,
      `SELECT ?position ?car ?reversed WHERE { <${unit}> metro:cars [ metro:position ?position ; metro:carType ?car ; metro:reversed ?reversed ] }`,
    ).sort((left, right) => Number(left.at(0)) - Number(right.at(0)));
    expect(cars).toHaveLength(6);
    expect(cars.at(0)).toEqual([
      "1",
      `${METRO_NAMESPACE}car-70-driving`,
      "false",
    ]);
    expect(cars.at(5)).toEqual([
      "6",
      `${METRO_NAMESPACE}car-70-driving`,
      "true",
    ]);
  });

  it("writes a formation's units and a rolling stock's formations", () => {
    const formation = `${METRO_NAMESPACE}series-70-fixed`;
    const text = writeEntityTurtle(findRecord(formation), exampleDataset);
    expect(
      ask(
        text,
        `SELECT ?unit WHERE { <${formation}> metro:units [ metro:position 1 ; metro:unit ?unit ] }`,
      ),
    ).toEqual([[`${METRO_NAMESPACE}unit-70`]]);
  });

  it("writes a car type's measures and its cab", () => {
    const carType = `${METRO_NAMESPACE}car-70-driving`;
    const text = writeEntityTurtle(findRecord(carType), exampleDataset);
    expect(
      ask(
        text,
        `SELECT ?cab WHERE { <${carType}> metro:hasCab ?cab ; metro:length ?length ; metro:capacity ?capacity }`,
      ),
    ).toEqual([["true"]]);
  });

  it("writes a class with its superclass", () => {
    const interchange = `${METRO_NAMESPACE}Interchange`;
    const text = writeEntityTurtle(findRecord(interchange), exampleDataset);
    expect(
      ask(
        text,
        `SELECT ?super WHERE { <${interchange}> a owl:Class ; rdfs:subClassOf ?super }`,
      ),
    ).toEqual([[`${METRO_NAMESPACE}Station`]]);
  });

  it("writes a root class without a superclass", () => {
    const line = `${METRO_NAMESPACE}Line`;
    const text = writeEntityTurtle(findRecord(line), exampleDataset);
    expect(text).not.toContain("subClassOf");
  });

  it("refuses a value no declared property states", () => {
    expect(() =>
      writeEntityTurtle(findRecord(CENTRAL), {
        ...exampleDataset,
        properties: [],
      }),
    ).toThrow("the dataset declares no property named platformCount");
  });

  it("escapes a string and writes a non-integer number as a double", () => {
    const text = writeEntityTurtle(
      {
        uri: `${METRO_NAMESPACE}probe`,
        type: `${METRO_NAMESPACE}Line`,
        typename: "Line",
        labels: { "": 'say "hi"\\\n\tnow\r' },
        code: "P",
        colour: "#000000",
        platformLength: 1.5,
      },
      exampleDataset,
    );
    expect(
      ask(
        text,
        `SELECT ?label ?length WHERE { ?s rdfs:label ?label ; metro:platformLength ?length }`,
      ),
    ).toEqual([['say "hi"\\\n\tnow\r', "1.5"]]);
  });

  it("writes an IRI no prefix fits in full", () => {
    const text = writeEntityTurtle(
      {
        uri: "https://elsewhere.example/thing",
        type: `${METRO_NAMESPACE}Zone`,
        typename: "Zone",
      },
      exampleDataset,
    );
    expect(text).toContain("<https://elsewhere.example/thing>");
  });
});
