import { describe, expect, it } from "vitest";
import { CS_PREDICATES } from "./constants.js";
import readExamples from "./readExamples.js";

describe("readExamples", () => {
  it("reads an example without a language as the empty string, and skips a value that is not an example", () => {
    const groups = [
      {
        predicateUri: CS_PREDICATES.do,
        total: 2,
        values: [
          {
            __typename: "StatementNested",
            groups: [
              {
                predicateUri: CS_PREDICATES.description,
                values: [{ __typename: "StatementLiteral", lexical: "Say so" }],
              },
              {
                predicateUri: CS_PREDICATES.code,
                values: [{ __typename: "StatementLiteral", lexical: "\nx\n" }],
              },
            ],
          },
          { __typename: "%other" },
        ],
      },
    ] as never;

    expect(readExamples(groups, CS_PREDICATES.do)).toEqual({
      examples: [{ description: "Say so", language: "", code: "x" }],
      total: 2,
    });
  });

  it("reads none of a kind the standard does not have", () => {
    expect(readExamples([], CS_PREDICATES.dont)).toEqual({
      examples: [],
      total: 0,
    });
  });
});
