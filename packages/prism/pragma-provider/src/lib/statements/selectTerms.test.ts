import { describe, expect, it } from "vitest";
import { selectTerms } from "./selectTerms.js";

describe("selectTerms", () => {
  it("returns a SELECT result's rows with their terms", async () => {
    const row = { v: { termType: "NamedNode" as const, value: "urn:a" } };
    const rows = await selectTerms(
      async () => ({
        type: "select",
        variables: ["v"],
        bindings: [{ v: "urn:a" }],
        termBindings: [row],
      }),
      "SELECT ?v WHERE { ?v ?p ?o }",
    );
    expect(rows).toEqual([row]);
  });

  it("throws on any other result", async () => {
    await expect(
      selectTerms(async () => ({ type: "ask", result: true }), "ASK {}"),
    ).rejects.toThrow("expected a SELECT result for statements, got ask");
  });
});
