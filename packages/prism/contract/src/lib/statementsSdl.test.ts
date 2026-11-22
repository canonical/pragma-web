import { buildSchema } from "graphql";
import { describe, expect, it } from "vitest";
import { STATEMENTS_PER_PREDICATE } from "./constants.js";
import { readContractSdl } from "./contractSdl.js";
import { servesExtension } from "./servesExtension.js";
import { readStatementsSdl } from "./statementsSdl.js";

describe("readStatementsSdl", () => {
  it("extends the contract into a schema that builds", () => {
    const schema = buildSchema(`${readContractSdl()}\n${readStatementsSdl()}`);
    expect(schema.getType("StatementGroups")).toBeDefined();
  });

  it("serves the extension by its declared signature", () => {
    expect(
      servesExtension(
        `${readContractSdl()}\n${readStatementsSdl()}`,
        "statements",
      ),
    ).toBe(true);
  });

  it("defaults each group's bound to the declared one", () => {
    const field = buildSchema(`${readContractSdl()}\n${readStatementsSdl()}`)
      .getQueryType()
      ?.getFields().statements;
    expect(
      field?.args.find(({ name }) => name === "perPredicate")?.defaultValue,
    ).toBe(STATEMENTS_PER_PREDICATE);
  });
});
