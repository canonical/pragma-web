import { createSchema } from "@canonical/dataviews-core";
import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import speakClause from "./speakClause.js";
import { readLabelsStandIn } from "./utils/index.js";

const schema = createSchema([
  { field: "status", kind: "choices", options: ["ready", "deployed"] },
  { field: "cores", kind: "number" },
  { field: "owner", kind: "presence" },
]);
const messages = resolveMessages();
const labels = readLabelsStandIn();

/** A clause on a field, as far as it is chosen. */
const clause = (
  field: string,
  operator: "isAny" | "gte" | "isSet" | null,
  operands: readonly (string | number | boolean)[],
) => ({ kind: "predicate", origin: null, field, operator, operands }) as const;

describe("speakClause", () => {
  it("speaks a clause by its label, its operator's words and its values", () => {
    expect(
      speakClause(
        clause("status", "isAny", ["ready", "deployed"]),
        schema,
        labels,
        messages,
      ),
    ).toBe("status is any of ready, deployed");
    expect(
      speakClause(clause("cores", "gte", [4]), schema, labels, messages),
    ).toBe("cores at least 4");
  });

  it("speaks presence's value in its operator, and a draft by its field alone", () => {
    expect(
      speakClause(clause("owner", "isSet", [false]), schema, labels, messages),
    ).toBe("owner has no value");
    expect(
      speakClause(clause("status", null, []), schema, labels, messages),
    ).toBe("status");
  });

  it("speaks the search by its text", () => {
    expect(
      speakClause(
        { kind: "search", origin: { id: "search", ref: null }, text: "ex web" },
        schema,
        labels,
        messages,
      ),
    ).toBe("Search for ex web");
  });
});
