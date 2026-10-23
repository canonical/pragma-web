import { describe, expect, it } from "vitest";
import { readSidecarName } from "./readSidecarName.js";

describe("readSidecarName", () => {
  it("reads a name without a language one way, in the default language", () => {
    expect(readSidecarName("button.md")).toEqual([
      { localName: "button", lang: "en" },
    ]);
  });

  it("reads a language segment both as part of the name and as a language", () => {
    expect(readSidecarName("button.fr.md")).toEqual([
      { localName: "button.fr", lang: "en" },
      { localName: "button", lang: "fr" },
    ]);
  });

  it("reads a language with subtags", () => {
    expect(readSidecarName("button.pt-BR.md")).toEqual([
      { localName: "button.pt-BR", lang: "en" },
      { localName: "button", lang: "pt-BR" },
    ]);
  });

  it("offers both readings of a dotted local name ending in a language-like segment", () => {
    expect(readSidecarName("lit.component.ssr.md")).toEqual([
      { localName: "lit.component.ssr", lang: "en" },
      { localName: "lit.component", lang: "ssr" },
    ]);
  });

  it("does not read a segment that is not a language tag as one", () => {
    expect(readSidecarName("button.FR.md")).toEqual([
      { localName: "button.FR", lang: "en" },
    ]);
    expect(readSidecarName("css.selectors.namespace.md")).toEqual([
      { localName: "css.selectors.namespace", lang: "en" },
    ]);
  });

  it("does not read a leading segment as a language", () => {
    expect(readSidecarName(".fr.md")).toEqual([
      { localName: ".fr", lang: "en" },
    ]);
  });

  it("refuses a name without the sidecar extension", () => {
    expect(() => readSidecarName("button.ttl")).toThrow(
      /button\.ttl is not a prose sidecar/,
    );
  });
});
