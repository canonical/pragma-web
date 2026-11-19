import { describe, expect, it } from "vitest";
import nameTableTerms from "./nameTableTerms.js";

const NAMESPACES = [
  { prefix: "ds", namespace: "https://ds.canonical.com/" },
  { prefix: "metro", namespace: "https://metro.example/" },
];

describe("nameTableTerms", () => {
  it("names a loaded term by its prefix and local name", () => {
    expect(
      nameTableTerms(["https://ds.canonical.com/Component"], NAMESPACES).get(
        "https://ds.canonical.com/Component",
      ),
    ).toEqual({ prefix: "ds", local: "Component", term: "ds:Component" });
  });

  it("names a term no loaded namespace holds as the canvas names its stub", () => {
    const iri = "http://www.w3.org/2002/07/owl#Class";
    expect(nameTableTerms([iri], NAMESPACES).get(iri)).toEqual({
      prefix: "owl",
      local: "Class",
      term: "owl:Class",
    });
  });
});
