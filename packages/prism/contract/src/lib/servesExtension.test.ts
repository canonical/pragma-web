import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readContractSdl } from "./contractSdl.js";
import { servesExtension } from "./servesExtension.js";

const contractSdl = readContractSdl();

/** The contract extended with every extension a provider may serve. */
const extendedSdl = `${contractSdl}\n${readFileSync(
  new URL(
    "../testing/__fixtures__/extensionsProvider.sdl.txt",
    import.meta.url,
  ),
  "utf8",
)}`;

describe("servesExtension", () => {
  it("finds each extension a provider declares with its signature", () => {
    expect(servesExtension(extendedSdl, "source")).toBe(true);
  });

  it("finds none on the bare contract", () => {
    expect(servesExtension(contractSdl, "source")).toBe(false);
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
