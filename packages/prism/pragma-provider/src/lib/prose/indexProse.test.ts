import { describe, expect, it } from "vitest";
import { indexProse } from "./indexProse.js";
import type { ProseCandidate } from "./types.js";

const EX = "https://e.example/#";
const PREFIXES = { ex: EX };

/** A candidate for `iri` in `lang`, read from `path`. */
const candidate = (
  iri: string,
  lang: string,
  path: string,
  markdown = `text of ${path}`,
): ProseCandidate => ({ iri, lang, path, markdown });

describe("indexProse", () => {
  it("indexes a bound sidecar's prose by entity", () => {
    const { index, unbound } = indexProse({
      sidecars: [{ path: "p/a.md" }],
      candidates: [candidate(`${EX}a`, "en", "p/a.md", "[b](ex:b)")],
      subjects: new Set([`${EX}a`]),
      prefixes: PREFIXES,
    });
    expect(unbound).toEqual([]);
    expect(index.get(`${EX}a`)).toEqual({
      texts: { en: "[b](ex:b)" },
      availableLanguages: ["en"],
      references: [`${EX}b`],
    });
  });

  it("orders languages default first, then by code point", () => {
    const iri = `${EX}a`;
    const { index } = indexProse({
      sidecars: [],
      candidates: [
        candidate(iri, "zh", "p/a.zh.md"),
        candidate(iri, "fr", "p/a.fr.md"),
        candidate(iri, "en", "p/a.md"),
        candidate(iri, "pt-BR", "p/a.pt-BR.md"),
        candidate(iri, "de", "p/a.de.md"),
      ],
      subjects: new Set([iri]),
      prefixes: PREFIXES,
    });
    const document = index.get(iri);
    expect(document?.availableLanguages).toEqual([
      "en",
      "de",
      "fr",
      "pt-BR",
      "zh",
    ]);
    expect(Object.keys(document?.texts ?? {})).toEqual(
      document?.availableLanguages,
    );
  });

  it("unions the references of every language, default language first", () => {
    const iri = `${EX}a`;
    const { index } = indexProse({
      sidecars: [],
      candidates: [
        candidate(iri, "fr", "p/a.fr.md", "[c](ex:c) [b](ex:b)"),
        candidate(iri, "en", "p/a.md", "[b](ex:b)"),
        candidate(iri, "de", "p/a.de.md", "[d](ex:d) [c](ex:c)"),
      ],
      subjects: new Set([iri]),
      prefixes: PREFIXES,
    });
    expect(index.get(iri)?.references).toEqual([`${EX}b`, `${EX}d`, `${EX}c`]);
  });

  it("keeps only the readings the graph describes", () => {
    const { index } = indexProse({
      sidecars: [{ path: "p/a.fr.md" }],
      candidates: [
        candidate(`${EX}a.fr`, "en", "p/a.fr.md"),
        candidate(`${EX}a`, "fr", "p/a.fr.md"),
        candidate(`${EX}a`, "en", "p/a.md"),
      ],
      subjects: new Set([`${EX}a`]),
      prefixes: PREFIXES,
    });
    expect([...index.keys()]).toEqual([`${EX}a`]);
    expect(index.get(`${EX}a`)?.availableLanguages).toEqual(["en", "fr"]);
  });

  it("lists the sidecars that bind to nothing, including those with no candidate", () => {
    const { index, unbound } = indexProse({
      sidecars: [
        { path: "p/a.md" },
        { path: "p/NOTES.md" },
        { path: "p/loose/x.md" },
      ],
      candidates: [
        candidate(`${EX}a`, "en", "p/a.md"),
        candidate(`${EX}NOTES`, "en", "p/NOTES.md"),
      ],
      subjects: new Set([`${EX}a`]),
      prefixes: PREFIXES,
    });
    expect(unbound).toEqual(["p/NOTES.md", "p/loose/x.md"]);
    expect([...index.keys()]).toEqual([`${EX}a`]);
  });

  it("refuses a sidecar that names more than one entity", () => {
    expect(() =>
      indexProse({
        sidecars: [{ path: "p/a.fr.md" }],
        candidates: [
          candidate(`${EX}a.fr`, "en", "p/a.fr.md"),
          candidate(`${EX}a`, "fr", "p/a.fr.md"),
        ],
        subjects: new Set([`${EX}a.fr`, `${EX}a`]),
        prefixes: PREFIXES,
      }),
    ).toThrow(
      `prose sidecar p/a.fr.md names more than one entity (${EX}a.fr, ${EX}a)`,
    );
  });

  it("refuses two sidecars holding the same language of one entity", () => {
    expect(() =>
      indexProse({
        sidecars: [{ path: "p/a.en.md" }, { path: "p/a.md" }],
        candidates: [
          candidate(`${EX}a`, "en", "p/a.en.md"),
          candidate(`${EX}a`, "en", "p/a.md"),
        ],
        subjects: new Set([`${EX}a`]),
        prefixes: PREFIXES,
      }),
    ).toThrow(
      `prose sidecars p/a.en.md and p/a.md both hold the "en" text of ${EX}a`,
    );
  });

  it("refuses an entity with a translation but no default-language text", () => {
    expect(() =>
      indexProse({
        sidecars: [{ path: "p/a.fr.md" }],
        candidates: [candidate(`${EX}a`, "fr", "p/a.fr.md")],
        subjects: new Set([`${EX}a`]),
        prefixes: PREFIXES,
      }),
    ).toThrow(`${EX}a has prose in fr but none in the default language "en"`);
  });
});
