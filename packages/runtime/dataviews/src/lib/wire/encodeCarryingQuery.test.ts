/**
 * Encoding a query over a followed link whose refused clauses stand: the
 * clauses are carried as the link spelled them, less what the applied slice
 * supplied, so a destination widens nothing and brings back nothing it left
 * out.
 */
import { describe, expect, it } from "vitest";
import { respellLink } from "../../../testing/index.js";
import { canonicalizeSlice, type Slice } from "../query/index.js";
import { createSchema } from "../schema/index.js";
import encodeCarryingQuery from "./encodeCarryingQuery.js";

const machines = createSchema([
  {
    field: "status",
    kind: "choices",
    options: ["failed", "cancelled", "ready"],
  },
  { field: "name", kind: "text" },
  { field: "cpu", kind: "number" },
  { field: "gpu", kind: "presence" },
]);

const emptySlice: Slice = { filter: [], search: null, sort: [], group: [] };

const failedOnly: Slice = {
  ...emptySlice,
  filter: [{ field: "status", operator: "isAny", operands: ["failed"] }],
};

/** A followed link written back over itself, its refused keys carried. */
const respell = (link: string) => {
  const { decoded, written, reread } = respellLink(
    machines,
    new URLSearchParams(link),
  );
  return { decoded, written: written.toString(), reread };
};

describe("encodeCarryingQuery", () => {
  it("carries the refused clauses named, as spelled, where they stood", () => {
    const preserve = new URLSearchParams(
      "status=melted&gone__isAny=x&q=old&tab=overview",
    );
    // The search is not carried, so what is written replaces it.
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice: { ...emptySlice, search: "new" },
        window: null,
        preserve,
        carry: ["status", "gone__isAny"],
        applied: emptySlice,
      }).toString(),
    ).toBe("status=melted&gone__isAny=x&tab=overview&q=new");
  });

  it("keeps a carried key's refused values beside the ones it writes", () => {
    // `melted` was refused and `failed` applied: the key stands where it
    // stood, `failed` once and the refused value beside it.
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice: failedOnly,
        window: null,
        preserve: new URLSearchParams("status=failed&status=melted&tab=a"),
        carry: ["status"],
        applied: failedOnly,
      }).toString(),
    ).toBe("status=failed&status=melted&tab=a");
  });

  it("drops what the applied slice supplied from a carried key it does not write", () => {
    // The destination leaves the status out: `failed` is not brought back,
    // and the refused `melted` stands alone.
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice: emptySlice,
        window: null,
        preserve: new URLSearchParams("status=failed&status=melted"),
        carry: ["status"],
        applied: failedOnly,
      }).toString(),
    ).toBe("status=melted");
  });

  it("reads a carried key under either spelling of its operator", () => {
    // `status__isAny` supplied `failed` as `status` does: the key keeps the
    // link's spelling, `failed` once and `melted` beside it.
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice: failedOnly,
        window: null,
        preserve: new URLSearchParams(
          "status__isAny=failed&status__isAny=melted",
        ),
        carry: ["status__isAny"],
        applied: failedOnly,
      }).toString(),
    ).toBe("status__isAny=failed&status__isAny=melted");
  });

  it("reads a carried value as the grammar reads it, not by its spelling", () => {
    // `5.0` is the bound the applied slice holds as `5`: written once.
    const fromFive: Slice = {
      ...emptySlice,
      filter: [{ field: "cpu", operator: "gte", operands: [5] }],
    };
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice: fromFive,
        window: null,
        preserve: new URLSearchParams("cpu__gte=5.0"),
        carry: ["cpu__gte"],
        applied: fromFive,
      }).toString(),
    ).toBe("cpu__gte=5");
  });

  it("carries a key on an operator the grammar does not know whole", () => {
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice: emptySlice,
        window: null,
        preserve: new URLSearchParams("status__between=a"),
        carry: ["status__between"],
        applied: emptySlice,
      }).toString(),
    ).toBe("status__between=a");
  });

  it("drops a carried search the applied slice supplied", () => {
    const searched: Slice = { ...emptySlice, search: "web" };
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice: emptySlice,
        window: null,
        preserve: new URLSearchParams("q=web"),
        carry: ["q"],
        applied: searched,
      }).toString(),
    ).toBe("");
  });
  it("writes no conjunct over a carried refused one, and keeps both readable", () => {
    const preserve = new URLSearchParams(
      "status=failed&status__isAny__1=melted&status__isAny__2=ready",
    );
    const slice: Slice = {
      ...emptySlice,
      filter: [
        { field: "status", operator: "isAny", operands: ["failed"] },
        { field: "status", operator: "isAny", operands: ["ready"] },
      ],
    };
    const carry = ["status__isAny__1"];
    const written = encodeCarryingQuery({
      schema: machines,
      slice,
      window: null,
      preserve,
      carry,
      applied: slice,
    });
    expect(written.toString()).toBe(
      "status__isAny__1=melted&status=failed&status__isAny__2=ready",
    );
    // Written again over itself, nothing moves.
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice,
        window: null,
        preserve: written,
        carry,
        applied: slice,
      }).toString(),
    ).toBe(written.toString());
    // Cleared, the refused key leaves the applied conjuncts standing.
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice,
        window: null,
        preserve: written,
        carry: [],
        applied: slice,
      }).toString(),
    ).toBe("status=failed&status__isAny__1=ready");
  });

  it("writes a conjunct under the carried key that holds its values", () => {
    const slice: Slice = {
      ...emptySlice,
      filter: [
        { field: "status", operator: "isAny", operands: ["ready"] },
        { field: "status", operator: "isAny", operands: ["failed"] },
      ],
    };
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice,
        window: null,
        preserve: new URLSearchParams(
          "status=ready&status__isAny__1=failed&status__isAny__1=melted",
        ),
        carry: ["status__isAny__1"],
        applied: slice,
      }).toString(),
    ).toBe("status__isAny__1=failed&status__isAny__1=melted&status=ready");
  });

  it("reserves only the ordinals a refused conjunct spells", () => {
    // A refused spelling of ordinal 0 keeps that ordinal; a malformed
    // ordinal, an unknown operator, an undeclared field and a key the link
    // no longer holds reserve none.
    const slice: Slice = {
      ...emptySlice,
      filter: [{ field: "status", operator: "isAny", operands: ["ready"] }],
    };
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice,
        window: null,
        preserve: new URLSearchParams(
          "status__isAny=melted&status__isAny__x=a&status__between=b&gone__isAny__1=c",
        ),
        carry: [
          "status__isAny",
          "status__isAny__x",
          "status__between",
          "gone__isAny__1",
          "status__isAny__3",
        ],
        applied: slice,
      }).toString(),
    ).toBe(
      "status__isAny=melted&status__isAny__x=a&status__between=b&gone__isAny__1=c&status__isAny__1=ready",
    );
  });

  it("drops a carried search the destination moves", () => {
    const applied: Slice = { ...emptySlice, search: "old" };
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice: { ...emptySlice, search: "new" },
        window: null,
        preserve: new URLSearchParams("q=old"),
        carry: ["q"],
        applied,
      }).toString(),
    ).toBe("q=new");
  });
  it("keeps a carried key spelled with a padded ordinal as it stood", () => {
    const { decoded, written, reread } = respell(
      "cpu__gte__01=5&cpu__gte__01=6",
    );
    expect(written).toBe("cpu__gte__01=5&cpu__gte__01=6");
    expect(canonicalizeSlice(reread.slice)).toEqual(
      canonicalizeSlice(decoded.slice),
    );
    expect(reread.issues).toEqual(decoded.issues);
  });

  it("keeps a padded ordinal's refused option on its own conjunct", () => {
    const { decoded, written, reread } = respell(
      "status=ready&status__isAny__01=failed&status__isAny__01=melted",
    );
    expect(written).toBe(
      "status__isAny__01=failed&status__isAny__01=melted&status=ready",
    );
    expect(canonicalizeSlice(reread.slice)).toEqual(
      canonicalizeSlice(decoded.slice),
    );
    expect(reread.issues).toEqual(decoded.issues);
  });

  it("keeps an ignored extra value another conjunct holds", () => {
    const { decoded, reread } = respell(
      "cpu__gte=9&cpu__gte__1=8&cpu__gte__1=9",
    );
    expect(decoded.issues.map((issue) => issue.parameter)).toEqual([
      "cpu__gte__1",
    ]);
    expect(canonicalizeSlice(reread.slice)).toEqual(
      canonicalizeSlice(decoded.slice),
    );
    expect(reread.issues).toEqual(decoded.issues);
  });
  it("reads a carried key as the conjunct holding its first value", () => {
    const { decoded, written, reread } = respell(
      "cpu__gte=8&cpu__gte__1=9&cpu__gte__1=8",
    );
    expect(written).toBe("cpu__gte__1=9&cpu__gte__1=8&cpu__gte=8");
    expect(canonicalizeSlice(reread.slice)).toEqual(
      canonicalizeSlice(decoded.slice),
    );
    expect(reread.issues).toEqual(decoded.issues);
  });

  it("reads two carried keys as two conjuncts, never one twice", () => {
    const { decoded, reread } = respell(
      "status__isAny__1=ready&status__isAny__1=melted&status__isAny__2=ready&status__isAny__2=bogus",
    );
    const reasons = (issues: typeof decoded.issues) =>
      issues.map((issue) => issue.reason).sort();
    expect(reasons(reread.issues)).toEqual(reasons(decoded.issues));
  });
  it.each(["cpu__gte__1=4&cpu__gte__01=8", "cpu__gte=4&cpu__gte__0=8"])(
    "keeps a repeat under a second spelling of one ordinal: %s",
    (link) => {
      const { decoded, written, reread } = respell(link);
      expect(written).toBe(link);
      expect(reread.slice).toEqual(decoded.slice);
      expect(reread.issues).toEqual(decoded.issues);
    },
  );
  it.each(["cpu__gte=4&cpu__gte=8&cpu__gte__1=4&cpu__gte__01=8", "q=x&q=x"])(
    "keeps a refused repeat of an equal conjunct: %s",
    (link) => {
      const { decoded, written, reread } = respell(link);
      expect(written).toBe(link);
      expect(reread.slice).toEqual(decoded.slice);
      expect(reread.issues).toEqual(decoded.issues);
    },
  );
  it.each([
    "status=failed&status__isAny__1=failed&status__isAny__1=ready&status__isAny__1=melted",
    "cpu__lte=4&cpu__lte__1=x&cpu__lte__1=8&cpu__lte__1=4",
    "gpu__isSet=yes&gpu__isSet__0=yes",
  ])("claims each refused slot by the conjunct it reads: %s", (link) => {
    const { decoded, reread } = respell(link);
    expect(canonicalizeSlice(reread.slice)).toEqual(
      canonicalizeSlice(decoded.slice),
    );
    expect(reread.issues).toEqual(decoded.issues);
  });
  it("drops a blank spelling beside a refused key of its conjunct", () => {
    const { decoded, written, reread } = respell(
      "status__isAny=&status=melted",
    );
    expect(written).toBe("status=melted");
    expect(reread.issues).toEqual(decoded.issues);
  });
});
