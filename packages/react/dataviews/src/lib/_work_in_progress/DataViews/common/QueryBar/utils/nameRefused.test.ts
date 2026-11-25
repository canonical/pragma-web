import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import nameRefused from "./nameRefused.js";
import readLabelsStandIn from "./readLabelsStandIn.js";

const issue = (parameter: string, field: string | null) =>
  ({ parameter, field, code: "invalid", reason: "no" }) as const;

describe("nameRefused", () => {
  it("names a filter by its field, the search as such, and the rest as spelled", () => {
    const labels = readLabelsStandIn();
    const messages = resolveMessages();
    expect(
      nameRefused(issue("status__isNone", "status"), labels, messages),
    ).toBe("status");
    expect(nameRefused(issue("q", null), labels, messages)).toBe("Search");
    expect(nameRefused(issue("flavour", null), labels, messages)).toBe(
      "flavour",
    );
  });
});
