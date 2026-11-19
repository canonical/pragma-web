import { buildSchema } from "graphql";
import { describe, expect, it } from "vitest";
import { extendWithList } from "./extendWithList.js";

describe("extendWithList", () => {
  it("throws when the schema has no Node interface", () => {
    const schema = buildSchema("type Query { hello: String }");
    expect(() => extendWithList(schema)).toThrow(
      "the compiled schema has no Node interface to serve values on",
    );
  });
});
