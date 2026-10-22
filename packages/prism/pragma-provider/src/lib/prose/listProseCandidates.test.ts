import { describe, expect, it } from "vitest";
import { CORPUS_REFS_ROOT } from "../../testing/corpus.js";
import {
  cacheRefRoots,
  collectProseSidecars,
  collectTtlSources,
} from "../sources/index.js";
import { listProseCandidates } from "./listProseCandidates.js";

const DS = "https://design.example.org/ontology#";

describe("listProseCandidates", () => {
  const refRoots = cacheRefRoots(CORPUS_REFS_ROOT);
  const sources = collectTtlSources({ refRoots, semRoot: null });
  const candidates = listProseCandidates(
    collectProseSidecars(refRoots),
    sources,
  );
  const describeCandidates = (path: string) =>
    candidates
      .filter((candidate) => candidate.path === path)
      .map(({ iri, lang }) => ({ iri, lang }));

  it("reads a sidecar against the namespaces its directory declares", () => {
    expect(describeCandidates("design-system/data/button.md")).toEqual([
      { iri: `${DS}button`, lang: "en" },
    ]);
  });

  it("offers every reading of a name", () => {
    expect(describeCandidates("design-system/data/button.fr.md")).toEqual([
      { iri: `${DS}button.fr`, lang: "en" },
      { iri: `${DS}button`, lang: "fr" },
    ]);
  });

  it("offers each namespace declared in the directory", () => {
    expect(
      describeCandidates("design-system/definitions/NOTES.md").map(
        (candidate) => candidate.iri,
      ),
    ).toEqual([
      `${DS}NOTES`,
      "http://www.w3.org/2002/07/owl#NOTES",
      "http://www.w3.org/2000/01/rdf-schema#NOTES",
      "http://www.w3.org/2001/XMLSchema#NOTES",
    ]);
  });

  it("carries the sidecar's path and Markdown on each candidate", () => {
    const sidecar = { path: "pkg/data/thing.md", content: "# Thing" };
    expect(
      listProseCandidates(
        [sidecar],
        [
          {
            path: "pkg/data/a.ttl",
            content: "@prefix ex: <https://e.example/#> .",
          },
        ],
      ),
    ).toEqual([
      {
        iri: "https://e.example/#thing",
        lang: "en",
        path: "pkg/data/thing.md",
        markdown: "# Thing",
      },
    ]);
  });

  it("reads a namespace declared under two prefixes once", () => {
    expect(
      listProseCandidates(
        [{ path: "pkg/data/thing.md", content: "" }],
        [
          {
            path: "pkg/data/a.ttl",
            content:
              "@prefix ex: <https://e.example/#> .\n@prefix alias: <https://e.example/#> .",
          },
        ],
      ).map((candidate) => candidate.iri),
    ).toEqual(["https://e.example/#thing"]);
  });

  it("ignores Turtle in other directories", () => {
    expect(
      listProseCandidates(
        [{ path: "pkg/data/notes/thing.md", content: "" }],
        [
          {
            path: "pkg/data/a.ttl",
            content: "@prefix ex: <https://e.example/#> .",
          },
        ],
      ),
    ).toEqual([]);
  });
});
