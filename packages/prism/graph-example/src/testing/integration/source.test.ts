import { graphql } from "graphql";
import { describe, expect, it } from "vitest";
import { METRO_NAMESPACE } from "../../lib/provider/constants.js";
import { createExampleProvider } from "../../lib/provider/createExampleProvider.js";

const SOURCE_QUERY = "query Source($uri: ID!) { source(uri: $uri) }";

describe("the source root field", () => {
  const { schema, rootValue } = createExampleProvider();

  /** Ask the provider for `uri`'s source. */
  const ask = (uri: string) =>
    graphql({
      schema,
      rootValue,
      source: SOURCE_QUERY,
      variableValues: { uri },
    });

  it("serves an entity's statements as Turtle", async () => {
    const result = await ask(`${METRO_NAMESPACE}central-exchange`);
    expect(String(result.data?.source)).toContain("Central Exchange");
  });

  it("serves a class's statements as Turtle", async () => {
    const result = await ask(`${METRO_NAMESPACE}Station`);
    expect(String(result.data?.source)).toContain("owl:Class");
  });

  it("serves null for an IRI the dataset does not hold", async () => {
    expect(await ask(`${METRO_NAMESPACE}nowhere`)).toEqual({
      data: { source: null },
    });
  });
});
