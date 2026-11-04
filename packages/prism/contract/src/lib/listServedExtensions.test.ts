import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readContractSdl } from "./contractSdl.js";
import { listServedExtensions } from "./listServedExtensions.js";

const contractSdl = readContractSdl();

describe("listServedExtensions", () => {
  it("lists every served extension in the declared order", () => {
    const sdl = `${contractSdl}\n${readFileSync(
      new URL(
        "../testing/__fixtures__/extensionsProvider.sdl.txt",
        import.meta.url,
      ),
      "utf8",
    )}`;
    expect(listServedExtensions(sdl)).toEqual(["prose", "search", "source"]);
  });

  it("lists only the extensions a provider serves", () => {
    const sdl = `${contractSdl}\nextend type Query { source(uri: ID!): String }`;
    expect(listServedExtensions(sdl)).toEqual(["source"]);
  });

  it("lists nothing for the bare contract", () => {
    expect(listServedExtensions(contractSdl)).toEqual([]);
  });
});
