import type { QueryFn } from "@canonical/ke-graphql";
import { describe, expect, it } from "vitest";
import { bootCorpusQuery } from "../../testing/bootCorpusQuery.js";
import { selectTypedSubjects } from "./selectTypedSubjects.js";

const DS = "https://design.example.org/ontology#";

describe("selectTypedSubjects", () => {
  it("lists the instances and the classes the graph types, each once", async () => {
    const subjects = await selectTypedSubjects(await bootCorpusQuery());
    expect(subjects).toEqual(
      expect.arrayContaining([`${DS}button`, `${DS}card`, `${DS}Component`]),
    );
    expect(new Set(subjects).size).toBe(subjects.length);
  });

  it("leaves out an IRI that is only ever an object", async () => {
    const subjects = await selectTypedSubjects(await bootCorpusQuery());
    expect(subjects).not.toContain(`${DS}.subcomponent.button-label`);
  });

  it("refuses a result that is not a SELECT", async () => {
    const asking: QueryFn = async () => ({ type: "ask", result: true });
    await expect(selectTypedSubjects(asking)).rejects.toThrow(
      "expected a SELECT result for the typed subjects, got ask",
    );
  });
});
