import type { QueryFn } from "@canonical/ke-graphql";
import { describe, expect, it } from "vitest";
import { bootCorpusQuery } from "../../testing/bootCorpusQuery.js";
import { selectSubjects } from "./selectSubjects.js";

const DS = "https://design.example.org/ontology#";

describe("selectSubjects", () => {
  const query = bootCorpusQuery();

  /** A query function over the corpus that keeps every query it is sent. */
  const recordQueries = () => {
    const sent: string[] = [];
    const recording: QueryFn = async (text) => {
      sent.push(text);
      return (await query)(text);
    };
    return { sent, recording };
  };

  it("keeps the IRIs the graph describes", async () => {
    expect(
      await selectSubjects(await query, [
        `${DS}button`,
        `${DS}Component`,
        `${DS}nothing`,
      ]),
    ).toEqual(new Set([`${DS}button`, `${DS}Component`]));
  });

  it("asks nothing for an empty list", async () => {
    const { sent, recording } = recordQueries();
    expect(await selectSubjects(recording, [])).toEqual(new Set());
    expect(sent).toEqual([]);
  });

  it("leaves an IRI that could break out of the query out of it", async () => {
    const { sent, recording } = recordQueries();
    const hostile = `${DS}x> } ?s ?p ?o . VALUES ?s { <${DS}Component`;
    expect(await selectSubjects(recording, [`${DS}button`, hostile])).toEqual(
      new Set([`${DS}button`]),
    );
    expect(sent.join("\n")).not.toContain(hostile);
  });

  it("asks nothing when every IRI is unsafe", async () => {
    const { sent, recording } = recordQueries();
    expect(await selectSubjects(recording, ["has space"])).toEqual(new Set());
    expect(sent).toEqual([]);
  });

  it("refuses a result that is not a SELECT", async () => {
    const asking: QueryFn = async () => ({ type: "ask", result: true });
    await expect(selectSubjects(asking, [`${DS}button`])).rejects.toThrow(
      /expected a SELECT result for the prose subjects, got ask/,
    );
  });
});
