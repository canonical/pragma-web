import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readContractSdl } from "./contractSdl.js";
import { servesExtension } from "./servesExtension.js";
import { readStatementsSdl } from "./statementsSdl.js";

const contractSdl = readContractSdl();

/** The list extensions' types alone, without a field that serves them. */
const LIST_TYPES =
  "type NodeValue { field: ID! label: String! text: String uri: ID }";

/** The contract extended with every extension a provider may serve. */
const extendedSdl = `${contractSdl}\n${readFileSync(
  new URL(
    "../testing/__fixtures__/extensionsProvider.sdl.txt",
    import.meta.url,
  ),
  "utf8",
)}\n${readStatementsSdl()}`;

describe("servesExtension", () => {
  it("finds each extension a provider declares with its signature", () => {
    expect(servesExtension(extendedSdl, "source")).toBe(true);
    expect(servesExtension(extendedSdl, "statements")).toBe(true);
    expect(servesExtension(extendedSdl, "facetedInstances")).toBe(true);
  });

  it("finds an extension on the type it is declared on, not on Query", () => {
    expect(servesExtension(extendedSdl, "values")).toBe(true);
    const sdl = `${contractSdl}\n${LIST_TYPES}\nextend type Query { values(fields: [ID!]): [NodeValue!]! }`;
    expect(servesExtension(sdl, "values")).toBe(false);
  });

  it("refuses statements without its direction argument", () => {
    const sdl = `${contractSdl}\n${readStatementsSdl().replace(
      "direction: StatementDirection = OUT",
      "",
    )}`;
    expect(servesExtension(sdl, "statements")).toBe(false);
  });

  it("finds none on the bare contract", () => {
    expect(servesExtension(contractSdl, "source")).toBe(false);
    expect(servesExtension(contractSdl, "statements")).toBe(false);
  });

  it("refuses a field of the right name with another argument type", () => {
    const sdl = `${contractSdl}\nextend type Query { source(uri: String!): String }`;
    expect(servesExtension(sdl, "source")).toBe(false);
  });

  it("refuses a field with another return type", () => {
    const sdl = `${contractSdl}\nextend type Query { source(uri: ID!): String! }`;
    expect(servesExtension(sdl, "source")).toBe(false);
  });

  it("refuses a field with an argument of another name", () => {
    const sdl = `${contractSdl}\nextend type Query { source(id: ID!): String }`;
    expect(servesExtension(sdl, "source")).toBe(false);
  });

  it("refuses a field with another number of arguments", () => {
    const longer = `${contractSdl}\nextend type Query { source(uri: ID!, lang: String): String }`;
    const shorter = `${contractSdl}\nextend type Query { source: String }`;
    expect(servesExtension(longer, "source")).toBe(false);
    expect(servesExtension(shorter, "source")).toBe(false);
  });

  it("refuses an SDL that does not parse", () => {
    expect(servesExtension("type Query {", "source")).toBe(false);
  });

  it("refuses a schema with no query root", () => {
    expect(servesExtension("type Thing { id: ID }", "source")).toBe(false);
  });
});
