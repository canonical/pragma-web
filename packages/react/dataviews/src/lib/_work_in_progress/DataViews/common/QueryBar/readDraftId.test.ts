import { describe, expect, it } from "vitest";
import readDraftId from "./readDraftId.js";

describe("readDraftId", () => {
  it("names an edit by its clause and a new clause as the draft", () => {
    const draft = {
      kind: "predicate",
      field: "status",
      operator: null,
      operands: [],
    } as const;
    expect(readDraftId({ ...draft, origin: null })).toBe("draft");
    expect(
      readDraftId({
        ...draft,
        origin: {
          id: "status__isAny__0",
          ref: { field: "status", operator: "isAny", nth: 0 },
          held: { field: "status", operator: "isAny", operands: [] },
        },
      }),
    ).toBe("status__isAny__0");
  });
});
