import type { QueryFn } from "@canonical/ke-graphql";
import { describe, expect, it } from "vitest";
import { bootCorpusQuery } from "../../testing/bootCorpusQuery.js";
import { findRefusedIri } from "./findRefusedIri.js";

const DS = "https://design.example.org/ontology#";

describe("findRefusedIri", () => {
  const query = bootCorpusQuery();

  it("refuses nothing the store parses, described or not", async () => {
    expect(
      await findRefusedIri(await query, [
        `${DS}button`,
        `${DS}nothing`,
        "zz:thing",
        "mailto:a@b.c",
      ]),
    ).toBeUndefined();
  });

  it.each([
    [`${DS}button#usage`, "a second fragment"],
    ["https://example.com/100%", "a bare percent sign"],
    ["https://example.com/a[b]", "a bracket in the path"],
  ])("refuses %s (%s)", async (iri) => {
    const refused = await findRefusedIri(await query, [`${DS}button`, iri]);
    expect(refused?.iri).toBe(iri);
    expect(String(refused?.reason)).toMatch(/IRI parsing failed/);
  });

  it("names the first refused IRI in the order given", async () => {
    expect(
      (
        await findRefusedIri(await query, [
          "https://example.com/100%",
          `${DS}button#usage`,
        ])
      )?.iri,
    ).toBe("https://example.com/100%");
  });

  it("probes each IRI in a query of its own", async () => {
    const sent: string[] = [];
    const recording: QueryFn = async (text) => {
      sent.push(text);
      return (await query)(text);
    };
    await findRefusedIri(recording, [`${DS}button`, `${DS}Component`]);
    expect(sent).toHaveLength(2);
  });

  it("asks nothing for an empty list", async () => {
    const refusing: QueryFn = async () => {
      throw new Error("no query was expected");
    };
    expect(await findRefusedIri(refusing, [])).toBeUndefined();
  });
});
