import { describe, expect, it } from "vitest";
import { readContractSdl } from "../contractSdl.js";
import { writeFieldValuesQuery } from "./writeFieldValuesQuery.js";

const SDL = `${readContractSdl()}
type Point { _meta: EntityMeta! x: Int! }
type Plain { x: Int! }
union Either = Point | Plain
interface Shape { _meta: EntityMeta! }
interface Place implements Node { uri: ID! _meta: EntityMeta! }
type Stop implements Node {
  uri: ID!
  _meta: EntityMeta!
  name: String
  platforms: Int
  zone: OntologyClass
  lines: [OntologyClass!]!
  position: Point
  plain: Plain
  near: Node
  place: Place
  shape: Shape
  either: Either
  label(lang: String!): String
}`;

describe("writeFieldValuesQuery", () => {
  it("selects leaves, nodes and embedded values by what a list reads", () => {
    expect(
      writeFieldValuesQuery(SDL, "Stop", [
        "name",
        "zone",
        "lines",
        "position",
        "near",
        "place",
        "shape",
      ]),
    ).toBe(
      "query FieldValues($id: ID!) { node(id: $id) { ... on Stop { name zone { uri _meta { title } } lines { uri _meta { title } } position { _meta { title } } near { uri _meta { title } } place { uri _meta { title } } shape { _meta { title } } } } }",
    );
  });

  it("leaves out fields the type does not declare or a list cannot read", () => {
    expect(
      writeFieldValuesQuery(SDL, "Stop", [
        "note",
        "plain",
        "label",
        "platforms",
      ]),
    ).toBe(
      "query FieldValues($id: ID!) { node(id: $id) { ... on Stop { platforms } } }",
    );
  });

  it("answers null when no field can be read", () => {
    expect(writeFieldValuesQuery(SDL, "Stop", ["note"])).toBeNull();
    expect(writeFieldValuesQuery(SDL, "Missing", ["name"])).toBeNull();
  });
});
