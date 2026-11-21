// @vitest-environment node

// A list's referenced records keep their own type once the rows' values are
// read: a value that holds an entity carries its IRI as a plain string, so
// the store never files the value under the entity's record.

import { createEnvironment } from "@canonical/prism-core";
import { createExampleProvider } from "@canonical/prism-graph-example";
import { graphql } from "graphql";
import { createOperationDescriptor } from "relay-runtime";
import { describe, expect, it } from "vitest";
import indexQuery from "#relay/__generated__/EntityIndexQuery.graphql.js";

const STATION = "https://metro.example/onto#Station";

const CIRCLE_LINE = "https://metro.example/onto#circle-line";

describe("the index query's records", () => {
  it("keep each referenced entity's type name after its values are read", async () => {
    const provider = createExampleProvider();
    const variables = { classId: STATION, classUri: STATION, count: 30 };
    const result = await graphql({
      schema: provider.schema,
      rootValue: provider.rootValue,
      source: indexQuery.params.text ?? "",
      variableValues: variables,
    });
    expect(result.errors).toBeUndefined();
    const environment = createEnvironment({
      fetchFn: () => Promise.reject(new Error("the store answers")),
    });
    environment.commitPayload(
      createOperationDescriptor(indexQuery, variables),
      result.data as never,
    );
    const source = environment.getStore().getSource();
    const typenames = source
      .getRecordIDs()
      .map((id) => [id, source.get(id)?.__typename] as const);
    expect(
      typenames.filter(([, typename]) => typename === "NodeValue"),
    ).not.toEqual([]);
    expect(
      typenames.filter(
        ([id, typename]) => id.startsWith("https:") && typename === "NodeValue",
      ),
    ).toEqual([]);
    expect(source.get(CIRCLE_LINE)?.__typename).toBe("Line");
  });
});
