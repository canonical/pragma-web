import { createTranslator } from "@canonical/i18n-core";
import { describe, expect, it } from "vitest";
import formatPropertyKind from "./formatPropertyKind.js";
import { MESSAGES } from "./i18n/index.js";

const english = createTranslator("en", MESSAGES);

describe("formatPropertyKind", () => {
  it("names each contract kind through the catalog", () => {
    expect(formatPropertyKind("OBJECT", english)).toBe("object");
    expect(formatPropertyKind("DATATYPE", english)).toBe("datatype");
    expect(formatPropertyKind("ANNOTATION", english)).toBe("annotation");
  });

  it("reads every kind through the translator it is given", () => {
    const french = createTranslator("fr", {
      ...MESSAGES,
      "kind.object": "objet",
    });
    expect(formatPropertyKind("OBJECT", french)).toBe("objet");
  });

  it("reads a kind the catalog does not name as the provider's value", () => {
    expect(formatPropertyKind("REIFIED", english)).toBe("reified");
    expect(formatPropertyKind("toString", english)).toBe("tostring");
  });
});
