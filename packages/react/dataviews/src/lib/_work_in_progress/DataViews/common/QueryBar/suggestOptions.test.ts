import {
  createCollection,
  declareCapabilities,
} from "@canonical/dataviews-core";
import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import suggestOptions from "./suggestOptions.js";
import type { QueryBarDraft } from "./types.js";
import { readLabelsStandIn } from "./utils/index.js";

const collection = createCollection({
  identify: (record: { readonly id: string }) => record.id,
  fields: [
    { field: "status", kind: "choices", options: ["ready", "deployed"] },
    { field: "tags", kind: "choices" },
    { field: "memory", kind: "number" },
    { field: "owner", kind: "presence" },
    { field: "name", kind: "text" },
  ],
});

const capabilities = declareCapabilities(collection, {
  filter: {
    status: ["isAny", "isNone"],
    tags: ["isAny"],
    memory: ["gte"],
    owner: ["isSet"],
    name: ["contains"],
  },
});

/** A draft on one field, chosen so far up to its operator and values. */
const draftOn = (
  field: string,
  rest: Partial<Extract<QueryBarDraft, { readonly kind: "predicate" }>> = {},
): QueryBarDraft => ({
  kind: "predicate",
  origin: null,
  field,
  operator: null,
  operands: [],
  ...rest,
});

const base = {
  typed: "",
  schema: collection.schema,
  capabilities,
  messages: resolveMessages(),
  labels: readLabelsStandIn(),
  facets: { answered: null, latest: null },
} as const;

describe("suggestOptions", () => {
  it("offers the fields any operator is offered on, narrowed by what is typed", () => {
    const options = suggestOptions({ ...base, part: "field", draft: null });
    expect(options.map(({ id }) => id)).toEqual([
      "status",
      "tags",
      "memory",
      "owner",
      "name",
    ]);
    expect(options.at(0)).toEqual({
      id: "status",
      label: "status",
      current: false,
      choice: { kind: "field", field: "status" },
    });
    expect(
      suggestOptions({ ...base, part: "field", draft: null, typed: " MEM" }),
    ).toHaveLength(1);
    // The field the chip holds is the current one.
    expect(
      suggestOptions({ ...base, part: "field", draft: draftOn("tags") }).find(
        ({ current }) => current,
      )?.id,
    ).toBe("tags");
  });

  it("offers the declared operators as spoken, with a differing symbol as a hint", () => {
    expect(
      suggestOptions({ ...base, part: "operator", draft: draftOn("status") }),
    ).toEqual([
      {
        id: "isAny",
        label: "is any of",
        hint: ":",
        current: false,
        choice: { kind: "operator", operator: "isAny", operands: null },
      },
      {
        id: "isNone",
        label: "is none of",
        hint: "≠",
        current: false,
        choice: { kind: "operator", operator: "isNone", operands: null },
      },
    ]);
    const presence = suggestOptions({
      ...base,
      part: "operator",
      draft: draftOn("owner", {
        origin: {
          id: "owner__isSet__0",
          ref: { field: "owner", operator: "isSet", nth: 0 },
          held: { field: "owner", operator: "isSet", operands: [false] },
        },
        operator: "isSet",
        operands: [false],
      }),
    });
    expect(
      presence.map(({ id, label, hint, current }) => ({
        id,
        label,
        hint,
        current,
      })),
    ).toEqual([
      {
        id: "isSet:true",
        label: "has a value",
        hint: undefined,
        current: false,
      },
      {
        id: "isSet:false",
        label: "has no value",
        hint: undefined,
        current: true,
      },
    ]);
    // An operator shown in its words takes no hint.
    expect(
      suggestOptions({ ...base, part: "operator", draft: draftOn("name") }).at(
        0,
      )?.hint,
    ).toBeUndefined();
    // Editing a chip, the operator it holds is the current one.
    expect(
      suggestOptions({
        ...base,
        part: "operator",
        draft: draftOn("status", {
          origin: {
            id: "status__isAny__0",
            ref: { field: "status", operator: "isAny", nth: 0 },
            held: { field: "status", operator: "isAny", operands: ["ready"] },
          },
          operator: "isAny",
          operands: ["ready"],
        }),
      }).map(({ current }) => current),
    ).toEqual([true, false]);
    // A symbol typed for an operator narrows to it too.
    expect(
      suggestOptions({
        ...base,
        part: "operator",
        draft: draftOn("status"),
        typed: "!",
      }).map(({ id }) => id),
    ).toEqual(["isNone"]);
    expect(
      suggestOptions({
        ...base,
        part: "operator",
        draft: draftOn("status"),
        typed: "none",
      }).map(({ id }) => id),
    ).toEqual(["isNone"]);
  });

  it("offers a choice's options with counts where answered, the held ones current", () => {
    const options = suggestOptions({
      ...base,
      part: "value",
      draft: draftOn("status", { operator: "isAny", operands: ["ready"] }),
      facets: {
        answered: {
          status: {
            kind: "values",
            values: [
              { value: "deployed", count: { kind: "exact", value: 12 } },
            ],
          },
        },
        latest: null,
      },
    });
    expect(options).toEqual([
      {
        id: "ready",
        label: "ready",
        hint: undefined,
        current: true,
        choice: { kind: "value", operand: "ready" },
      },
      {
        id: "deployed",
        label: "deployed",
        hint: "12 records",
        current: false,
        choice: { kind: "value", operand: "deployed" },
      },
    ]);
    // The server's options are what the latest facet lists.
    expect(
      suggestOptions({
        ...base,
        part: "value",
        draft: draftOn("tags", { operator: "isAny" }),
        facets: {
          answered: {
            tags: {
              kind: "values",
              values: [{ value: "ex-gpu", count: { kind: "unknown" } }],
            },
          },
          latest: {
            tags: {
              kind: "values",
              values: [{ value: "ex-gpu", count: { kind: "unknown" } }],
            },
          },
        },
      }).map(({ id, hint }) => ({ id, hint })),
    ).toEqual([{ id: "ex-gpu", hint: undefined }]);
  });

  it("gives no count hint where the answered facet is not a list of values", () => {
    expect(
      suggestOptions({
        ...base,
        part: "value",
        draft: draftOn("status", { operator: "isAny" }),
        facets: {
          answered: { status: { kind: "range", min: null, max: null } },
          latest: null,
        },
      }).map(({ hint }) => hint),
    ).toEqual([undefined, undefined]);
  });

  it("offers nothing for a typed value, the search, or a field the schema lacks", () => {
    const typedValue = { ...base, part: "value" } as const;
    expect(
      suggestOptions({
        ...typedValue,
        draft: draftOn("memory", { operator: "gte" }),
      }),
    ).toEqual([]);
    expect(
      suggestOptions({
        ...base,
        part: "search",
        draft: {
          kind: "search",
          origin: { id: "search", ref: null },
          text: "ex",
        },
      }),
    ).toEqual([]);
    expect(
      suggestOptions({ ...base, part: "operator", draft: draftOn("gone") }),
    ).toEqual([]);
  });
});
